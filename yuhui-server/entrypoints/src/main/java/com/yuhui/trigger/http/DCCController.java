package com.yuhui.trigger.http;


import com.yuhui.trigger.api.DCCService;
import com.yuhui.trigger.api.dto.req.DCCRequestDTO;
import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.curator.framework.CuratorFramework;
import org.apache.zookeeper.data.Stat;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;

/**

 * degradeSwitch:close 抽奖是否降级 默认关闭
 * rateLimiterSwitch:open 抽奖是否进行限流 默认开启
 */
@Slf4j
@RestController
@CrossOrigin("*")
@RequestMapping("/dcc")
public class DCCController implements DCCService {
    @Resource
    private CuratorFramework client;
    private static final String BASE_CONFIG_PATH = "/lottery-dcc";
    private static final String BASE_CONFIG_PATH_CONFIG = BASE_CONFIG_PATH + "/config";

    @Override
    @PostMapping("/update_config")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    public BaseResponse<Boolean> updateConfig(@RequestBody DCCRequestDTO requestDTO) {
        String key = requestDTO.getKey();
        String value = requestDTO.getValue();
        try {
            log.info("DCC 动态配置值变更开始 key:{} value:{}", key, value);
            String keyPath = BASE_CONFIG_PATH_CONFIG.concat("/").concat(key);
            if (client.checkExists().forPath(keyPath) == null) {
                client.create().creatingParentsIfNeeded().forPath(keyPath);
                log.info("DCC 节点监听 base node {} not absent create new done!", keyPath);
            }
            Stat stat = client.setData().forPath(keyPath, value.getBytes(StandardCharsets.UTF_8));
            log.info("DCC 动态配置值变更完成 key:{} value:{} time:{}", key, value, stat.getCtime());
            return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage());
        } catch (Exception e) {
            log.info("DCC 动态配置值变更失败 key:{} value:{}", key, value);
            return new BaseResponse<>(ResponseCode.UN_ERROR.getCode(), ResponseCode.UN_ERROR.getMessage());
        }
    }

    @Override
    @GetMapping("/query_config")
    public BaseResponse<String> queryConfig(@RequestParam String key) {
        try {
            String keyPath = BASE_CONFIG_PATH_CONFIG.concat("/").concat(key);
            byte[] bytes = client.getData().forPath(keyPath);
            log.info("DCC 获取动态配置值成功 key:{} value:{}", key, new String(bytes, StandardCharsets.UTF_8));
            return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), ResponseCode.SUCCESS.getMessage(), new String(bytes, StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.info("DCC 获取动态配置值失败 key:{}", key);
            return new BaseResponse<>(ResponseCode.UN_ERROR.getCode(), ResponseCode.UN_ERROR.getMessage());
        }
    }
}
