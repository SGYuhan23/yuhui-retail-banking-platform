package com.yuhui.config;

import com.yuhui.marketing.reward.fulfillment.model.entity.DistributeAwardEntity;
import com.yuhui.marketing.reward.fulfillment.service.distribute.DistributeAward;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import java.sql.*;

/** Offline entitlement ledger for the two external award handlers absent from the supplied ZIP. */
@Configuration
@Profile("local")
public class LocalExternalAwards {
    private final Environment env;
    public LocalExternalAwards(Environment env) { this.env=env; }
    @Bean("user_ai") public DistributeAward ai() { return award -> settle("user_ai",award); }
    @Bean("vip") public DistributeAward vip() { return award -> settle("vip",award); }
    @Bean("bank_coupon") public DistributeAward coupon() { return award -> settle("bank_coupon",award); }
    @Bean("bank_service") public DistributeAward service() { return award -> settle("bank_service",award); }
    private void settle(String key, DistributeAwardEntity award) {
        String url="jdbc:mysql://"+env.getProperty("app.infra.mysql.host")+":"+env.getProperty("app.infra.mysql.port")+"/marketing?serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true";
        try (Connection c=DriverManager.getConnection(url,env.getProperty("app.infra.mysql.username"),env.getProperty("app.infra.mysql.password"))) {
            c.setAutoCommit(false);
            try {
                try (PreparedStatement p=c.prepareStatement("INSERT IGNORE INTO local_entitlement(user_order_id,user_id,activity_id,award_id,award_key,award_config) VALUES(?,?,?,?,?,?)")) {
                    p.setLong(1,award.getUserOrderId());p.setString(2,award.getUserId());p.setLong(3,award.getActivityId());p.setLong(4,award.getAwardId());p.setString(5,key);p.setString(6,award.getAwardConfig());p.executeUpdate();
                }
                for(int db=1;db<=2;db++) for(int tb=0;tb<4;tb++) {
                    try (PreparedStatement p=c.prepareStatement("UPDATE marketing_0"+db+".user_award_record_"+String.format("%03d",tb)+" SET award_state='complete' WHERE user_order_id=? AND user_id=? AND award_id=?")) {
                        p.setLong(1,award.getUserOrderId());p.setString(2,award.getUserId());p.setLong(3,award.getAwardId());p.executeUpdate();
                    }
                }
                c.commit();
            } catch(Exception e) { c.rollback();throw e; }
        } catch(Exception e) { throw new IllegalStateException("Local entitlement settlement failed",e); }
    }
}
