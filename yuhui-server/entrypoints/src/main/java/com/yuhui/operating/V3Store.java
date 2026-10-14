package com.yuhui.operating;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import java.sql.*;
import java.util.*;

/** Local P0 ledger storage. All financial mutations use a single JDBC transaction. */
@Component @Profile("local")
public class V3Store {
    private final Environment env;
    public static final ObjectMapper JSON = new ObjectMapper();
    public V3Store(Environment env) { this.env=env; }
    public Connection open() throws SQLException {
        return DriverManager.getConnection("jdbc:mysql://"+env.getProperty("app.infra.mysql.host")+":"+env.getProperty("app.infra.mysql.port")+"/marketing?serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true",env.getProperty("app.infra.mysql.username"),env.getProperty("app.infra.mysql.password"));
    }
    public interface Work<T> { T run(Connection c) throws Exception; }
    public <T> T tx(Work<T> work) throws Exception {
        try(Connection c=open()) { c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);c.setAutoCommit(false);
            try { T value=work.run(c);c.commit();return value; } catch(Exception e) {c.rollback();throw e;}
        }
    }
    public static void bind(PreparedStatement p,Object... args) throws SQLException { for(int i=0;i<args.length;i++) p.setObject(i+1,args[i]); }
    public static int exec(Connection c,String sql,Object... args) throws SQLException { try(PreparedStatement p=c.prepareStatement(sql)){bind(p,args);return p.executeUpdate();} }
    public static long insert(Connection c,String sql,Object... args) throws SQLException {try(PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){bind(p,args);p.executeUpdate();try(ResultSet r=p.getGeneratedKeys()){if(!r.next())throw new SQLException("Missing generated key");return r.getLong(1);}}}
    public static List<Map<String,Object>> rows(Connection c,String sql,Object... args) throws SQLException {
        try(PreparedStatement p=c.prepareStatement(sql)){bind(p,args);try(ResultSet r=p.executeQuery()){List<Map<String,Object>> out=new ArrayList<>();ResultSetMetaData md=r.getMetaData();while(r.next()){Map<String,Object> m=new LinkedHashMap<>();for(int i=1;i<=md.getColumnCount();i++){Object v=r.getObject(i);m.put(md.getColumnLabel(i),v instanceof Timestamp?v.toString():v);}out.add(m);}return out;}}
    }
    public static Map<String,Object> one(Connection c,String sql,Object... args) throws SQLException {List<Map<String,Object>> r=rows(c,sql,args);if(r.isEmpty())throw new IllegalArgumentException("记录不存在");return r.get(0);}
    public static long n(Object o){return o==null?0:o instanceof Boolean?((Boolean)o?1:0):Long.parseLong(o.toString());}
    public static String s(Object o){return Objects.toString(o,"");}
    public static String json(Object o){try{return JSON.writeValueAsString(o);}catch(Exception e){throw new IllegalArgumentException("JSON 无效",e);}}
    public static Map<String,Object> obj(Object o){try{return JSON.readValue(s(o),new TypeReference<Map<String,Object>>(){});}catch(Exception e){throw new IllegalArgumentException("JSON 无效",e);}}
    public static void require(boolean valid,String message){if(!valid)throw new IllegalArgumentException(message);}
}
