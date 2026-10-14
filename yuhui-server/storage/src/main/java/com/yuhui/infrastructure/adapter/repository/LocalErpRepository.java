package com.yuhui.infrastructure.adapter.repository;
import com.yuhui.querys.adapter.repository.EsErpRepository;
import com.yuhui.querys.model.valobj.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import javax.annotation.PostConstruct;
import java.util.*;

/** Local read model reads the real shards directly, with no Canal/Elasticsearch lag. */
@Repository
@Profile("local")
public class LocalErpRepository implements EsErpRepository {
    @Value("${app.infra.mysql.host}") private String host;
    @Value("${app.infra.mysql.port}") private String port;
    @Value("${app.infra.mysql.username}") private String username;
    @Value("${app.infra.mysql.password}") private String password;
    private JdbcTemplate jdbc;
    @PostConstruct public void init() {
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:mysql://"+host+":"+port+"/marketing?serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true", username, password));
    }
    private <T> List<T> read(String table, boolean sharded, Class<T> type, Long activityId, int limit) {
        List<String> queries = new ArrayList<>();
        List<Object> args = new ArrayList<>();
        for (int db=1; db<=2; db++) {
            for (int tb=0; tb<(sharded ? 4 : 1); tb++) {
                queries.add("SELECT * FROM marketing_0"+db+"."+table+(sharded ? String.format("_%03d",tb) : "")+(activityId == null ? "" : " WHERE activity_id=?"));
                if (activityId != null) args.add(activityId);
            }
        }
        return jdbc.query(String.join(" UNION ALL ",queries)+" ORDER BY update_time DESC LIMIT "+limit, new BeanPropertyRowMapper<>(type), args.toArray());
    }
    public List<EsUserOrderVO> queryEsUserOrderVOList() { return read("user_order", true, EsUserOrderVO.class, null, 10000); }
    public List<EsActivityAccountVO> queryEsActivityAccountVOList() { return read("activity_account", false, EsActivityAccountVO.class, null, 10000); }
    public List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList() { return read("user_award_record", true, EsUserAwardRecordVO.class, null, 10000); }
    public List<EsCreditAccountVO> queryCreditAccountVOList() { return read("credit_account", false, EsCreditAccountVO.class, null, 10000); }
    public List<EsCreditRecordVO> queryCreditRecordVOList() { return read("credit_record", true, EsCreditRecordVO.class, null, 10000); }
    public List<EsActivityRecordVO> queryEsActivityRecordVOList() { return read("activity_record", true, EsActivityRecordVO.class, null, 10000); }
    public List<EsUserBehaviorRebateOrderVO> queryEsUserBehaviorRebateOrderVOList() { return read("user_behavior_rebate_order", true, EsUserBehaviorRebateOrderVO.class, null, 10000); }
    public List<EsUserAwardRecordVO> queryEsUserAwardRecordVOList(Long activityId) { return read("user_award_record",true,EsUserAwardRecordVO.class,activityId,5); }
    public List<EsUserAwardRecordSimpleVO> queryUserAwardRecordSimpleEsByActivityId(Long activityId) { return read("user_award_record",true,EsUserAwardRecordSimpleVO.class,activityId,20); }
}
