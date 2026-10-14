package com.yuhui.trigger.http;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;
import java.sql.*;
import java.util.*;

/** Offline wallet scoped to the fixed demo principal. Never redeems a real bank benefit. */
@RestController @Profile("local")
public class LocalWalletController {
    private final Environment env;
    public LocalWalletController(Environment env) { this.env=env; }
    private Connection connection() throws SQLException {
        return DriverManager.getConnection("jdbc:mysql://"+env.getProperty("app.infra.mysql.host")+":"+env.getProperty("app.infra.mysql.port")+"/marketing?serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true",env.getProperty("app.infra.mysql.username"),env.getProperty("app.infra.mysql.password"));
    }
    @GetMapping("/local/wallet") public Map<String,Object> wallet() throws SQLException {
        List<Map<String,Object>> items=new ArrayList<>();
        try(Connection c=connection(); PreparedStatement p=c.prepareStatement("SELECT CAST(e.user_order_id AS CHAR) id, a.award_desc title, e.award_config quantity, e.create_time, r.redeemed_at FROM local_entitlement e JOIN award a ON a.id=e.award_id LEFT JOIN local_entitlement_redemption r ON r.user_order_id=e.user_order_id WHERE e.user_id=? AND e.award_key IN ('bank_coupon','bank_service') ORDER BY e.create_time DESC")) {
            p.setString(1,"10002");
            try(ResultSet rs=p.executeQuery()) { while(rs.next()) {
                Map<String,Object> row=new LinkedHashMap<>();
                row.put("id",rs.getString("id"));row.put("title",rs.getString("title"));row.put("quantity",rs.getString("quantity"));row.put("createdAt",rs.getString("create_time"));row.put("redeemedAt",rs.getString("redeemed_at"));items.add(row);
            }}
        }
        return Map.of("code",1000,"data",items,"message","成功");
    }
    @PostMapping("/local/wallet/redeem") public Map<String,Object> redeem(@RequestBody Map<String,String> body) throws SQLException {
        String id=body.get("orderId");
        if(id==null || !id.matches("[0-9]{1,19}")) return Map.of("code",4000,"message","权益编号无效");
        // Single SQL statement enforces ownership and a unique key prevents concurrent double redemption.
        try(Connection c=connection(); PreparedStatement p=c.prepareStatement("INSERT IGNORE INTO local_entitlement_redemption(user_order_id,user_id) SELECT user_order_id,user_id FROM local_entitlement WHERE user_order_id=? AND user_id=? AND award_key IN ('bank_coupon','bank_service')")) {
            p.setString(1,id);p.setString(2,"10002");
            return p.executeUpdate()==1 ? Map.of("code",1000,"message","演示权益已核销") : Map.of("code",4001,"message","权益不可用或已核销");
        }
    }
}
