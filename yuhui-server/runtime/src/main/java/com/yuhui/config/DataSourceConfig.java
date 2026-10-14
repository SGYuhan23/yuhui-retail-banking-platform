package com.yuhui.config;


import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.config.GlobalConfig;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.elasticsearch.xpack.sql.jdbc.EsDataSource;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;
import java.util.Properties;

/**

 * 数据源配置
 */
@Configuration
public class DataSourceConfig {

    @Configuration
    @org.springframework.context.annotation.Profile("!local")
    @MapperScan(basePackages = "com.yuhui.infrastructure.es", sqlSessionFactoryRef = "elasticsearchSqlSessionFactory")
    static class ElasticsearchMyBatisConfig {

        @Bean("elasticsearchDataSource")
        @ConfigurationProperties(prefix = "spring.elasticsearch.datasource")
        public DataSource igniteDataSource(Environment environment) {
            EsDataSource esDataSource = new EsDataSource();
            esDataSource.setUrl(environment.getProperty("spring.elasticsearch.datasource.url"));
            Properties props = new Properties();
            props.setProperty("user", environment.getProperty("spring.elasticsearch.datasource.username"));
            props.setProperty("password", environment.getProperty("spring.elasticsearch.datasource.password"));
            esDataSource.setProperties(props);
            return esDataSource;
        }

        @Bean("elasticsearchSqlSessionFactory")
        public SqlSessionFactory elasticsearchSqlSessionFactory(@Qualifier("elasticsearchDataSource") DataSource elasticsearchDataSource) throws Exception {
            SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
            factoryBean.setDataSource(elasticsearchDataSource);
            factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/es/*.xml"));
            return factoryBean.getObject();
        }
    }

    @Configuration
    @MapperScan(basePackages = "com.yuhui.infrastructure.dao", sqlSessionFactoryRef = "mysqlSqlSessionFactory")
    static class MysqlMyBatisPlusConfig {

        @Bean("mysqlSqlSessionFactory")
        public SqlSessionFactory mysqlSqlSessionFactory(DataSource mysqlDataSource, Interceptor dbRouterDynamicMybatisPlugin) throws Exception {
            // 开启 mybatis-plus 分页功能
            MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
            mybatisPlusInterceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL)); // MySQL 分页支持

            MybatisSqlSessionFactoryBean factoryBean = new MybatisSqlSessionFactoryBean();
            factoryBean.setDataSource(mysqlDataSource);
            factoryBean.setPlugins(dbRouterDynamicMybatisPlugin, mybatisPlusInterceptor);
            factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver()
                    .getResources("classpath:mapper/mysql/*.xml"));

            // 使用 GlobalConfig 配置 MyBatis-Plus 特性
            GlobalConfig globalConfig = new GlobalConfig();
            globalConfig.setBanner(false); // 关闭启动 banner
            globalConfig.setDbConfig(new GlobalConfig.DbConfig()
                    .setTableUnderline(true)); // 下划线转驼峰

            // 将 GlobalConfig 设置到 MybatisSqlSessionFactoryBean 中
            factoryBean.setGlobalConfig(globalConfig);

            return factoryBean.getObject();
        }
    }

//    /**
//     * Mybatis用法
//     */
//    @Configuration
//    @MapperScan(basePackages = "com.yuhui.infrastructure.dao", sqlSessionFactoryRef = "mysqlSqlSessionFactory")
//    static class MysqlMyBatisConfig {
//
//        @Bean("mysqlSqlSessionFactory")
//        public SqlSessionFactory mysqlSqlSessionFactory(DataSource mysqlDataSource, Interceptor dbRouterDynamicMybatisPlugin) throws Exception {
//            SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
//            factoryBean.setDataSource(mysqlDataSource);
//            factoryBean.setPlugins(dbRouterDynamicMybatisPlugin);
//            factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/mysql/*.xml"));
//            return factoryBean.getObject();
//        }
//
//    }

}

