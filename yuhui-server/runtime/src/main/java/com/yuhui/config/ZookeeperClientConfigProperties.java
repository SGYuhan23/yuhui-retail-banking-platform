package com.yuhui.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**

 * zookeeper 配置属性
 */
@Data
@ConfigurationProperties(prefix = "zookeeper.sdk.config", ignoreInvalidFields = true)
public class ZookeeperClientConfigProperties {
    private String connectString;
    private int baseSleepTimeMs;
    private int maxRetries;
    private int sessionTimeoutMs;
    private int connectionTimeoutMs;
}
