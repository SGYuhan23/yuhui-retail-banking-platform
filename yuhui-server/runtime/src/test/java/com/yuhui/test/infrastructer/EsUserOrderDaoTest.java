package com.yuhui.test.infrastructer;


import com.alibaba.fastjson.JSON;
import com.yuhui.infrastructure.es.EsUserOrderMapper;
import com.yuhui.infrastructure.es.po.EsUserOrder;
import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.annotation.Resource;
import java.util.List;

@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class EsUserOrderDaoTest {

    @Resource
    private EsUserOrderMapper esUserOrderMapper;

    @Test
    public void test_queryUserOrderList() {
        List<EsUserOrder> userOrders = esUserOrderMapper.queryUserOrderListEs();
        log.info("测试结果：{}", JSON.toJSONString(userOrders));
    }

}
