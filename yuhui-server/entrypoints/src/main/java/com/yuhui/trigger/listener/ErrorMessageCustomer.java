package com.yuhui.trigger.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

/**

 * 发奖
 */
@Slf4j
@Component
public class ErrorMessageCustomer {

    @RabbitListener(queues = "error.queue")
    public void listener(String message) throws IOException {
        // 定义文件路径
        String filePath = "./data/mq_error/error-msg";
        File dir = new File("./data/mq_error");
        if (!dir.exists()) {
            dir.mkdirs(); // 创建目录
        }
        File file = new File(filePath);
        if (!file.exists()) {
            file.createNewFile(); // 创建文件
        }
        // 写入文件
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath, true))) {
            writer.write(message);
            writer.newLine(); // 每条消息占一行
            log.info("[ErrorMessageCustomer]mq消息消费异常，已写入文件`./data/error-msg`中，请手动处理 message: {}", message);
        } catch (IOException e) {
            log.error("[ErrorMessageCustomer]mq消息消费异常，写入文件失败：{}，请前往mq控制台处理", e.getMessage());
        }
    }
}
