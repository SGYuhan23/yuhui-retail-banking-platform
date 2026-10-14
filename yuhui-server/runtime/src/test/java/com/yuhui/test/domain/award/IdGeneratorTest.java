package com.yuhui.test.domain.award;

import com.github.yitter.contract.IdGeneratorOptions;
import com.github.yitter.idgen.YitIdHelper;
import org.junit.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class IdGeneratorTest {
    final static int genIdCount = 500000;

    //1-漂移算法，2-传统算法
    final static short method = 1;

    @Test
    public void testIdGenerator() throws InterruptedException {
        IdGeneratorOptions options = new IdGeneratorOptions();
        options.SeqBitLength = 10;
        options.Method = method;
        options.WorkerId = 1;

        YitIdHelper.setIdGenerator(options);
        // 创建30个线程
        for (int i = 0; i < 300; i++) {
            new Thread(() -> {
                for (int j = 0; j < 100; j++) { // 每个线程生成10个ID
                    long id = YitIdHelper.nextId();
                    System.out.println(id);
                }
            }).start();
        }
    }
}
