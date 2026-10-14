package com.yuhui.test.trigger;

import com.alibaba.fastjson.JSON;
import com.yuhui.trigger.api.LotteryActivityService;
import com.yuhui.trigger.api.dto.req.ActivityDrawRequestDTO;
import com.yuhui.trigger.api.dto.res.ActivityDrawResponseDTO;
import com.yuhui.types.model.BaseResponse;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.annotation.Resource;
import java.util.concurrent.CountDownLatch;

@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class ActivityControllerTest {
    @Resource
    private LotteryActivityService lotteryActivityService;
    @Test
    public void test_calendarSignRebate() throws InterruptedException {
//        BaseResponse<Boolean> response = lotteryActivityService.calendarSignRebate("synthetic_test_user");
//        log.info("测试结果：{}", JSON.toJSONString(response));

        new CountDownLatch(1).await();
    }
    @Test
    public void test_blacklist_draw() throws InterruptedException {
        ActivityDrawRequestDTO request = new ActivityDrawRequestDTO();
        request.setActivityId(100301L);
        request.setUserId("user001");
        BaseResponse<ActivityDrawResponseDTO> response = lotteryActivityService.draw(request);
        log.info("请求参数：{}", JSON.toJSONString(request));
        log.info("测试结果：{}", JSON.toJSONString(response));

        new CountDownLatch(1).await();
    }
}
