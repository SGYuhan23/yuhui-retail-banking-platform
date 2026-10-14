package com.yuhui.config;

import com.alibaba.fastjson2.JSONWriter;
import com.alibaba.fastjson2.support.config.FastJsonConfig;
import com.alibaba.fastjson2.support.spring6.http.converter.FastJsonHttpMessageConverter;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Json Converter 配置类
 *

 * @version 1.0
 */
@Configuration
public class JsonConfig implements WebMvcConfigurer {
    private static FastJsonConfig getFastJsonConfig() {
        FastJsonConfig config = new FastJsonConfig();

        config.setDateFormat("yyyy-MM-dd HH:mm:ss");
        config.setCharset(StandardCharsets.UTF_8);
        config.setWriterFeatures(
                // 输出 key 为字符串
                JSONWriter.Feature.FieldBased,
                // 输出 null 值
                JSONWriter.Feature.WriteNullListAsEmpty,
                // json 格式化
                JSONWriter.Feature.PrettyFormat,
                // 输出 map 中 value 为 null 的数据
                JSONWriter.Feature.WriteMapNullValue,
                // 输出 boolean 为 false
                JSONWriter.Feature.WriteNullBooleanAsFalse,
                // 输出 list 为 []
                JSONWriter.Feature.WriteNullListAsEmpty,
                // 输出 number 为 0
                JSONWriter.Feature.WriteNullNumberAsZero,
                // 输出字符串为 ""
                JSONWriter.Feature.WriteNullStringAsEmpty,
                // 输出 Long 类型的数据为字符串
                JSONWriter.Feature.WriteLongAsString
                //忽略为空的字段
//                JSONWriter.Feature.IgnoreNoneSerializable
        );
        return config;
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 1. 配置 fastjson
        FastJsonConfig config = getFastJsonConfig();

        // 2. 添加 fastjson 转换器
        FastJsonHttpMessageConverter converter = new FastJsonHttpMessageConverter();
        List<MediaType> supportedMediaTypes = new ArrayList<>();

        // 3. 添加支持类型
        supportedMediaTypes.add(MediaType.APPLICATION_JSON);
        supportedMediaTypes.add(MediaType.APPLICATION_ATOM_XML);
        supportedMediaTypes.add(MediaType.APPLICATION_FORM_URLENCODED);
        supportedMediaTypes.add(MediaType.APPLICATION_OCTET_STREAM);
        supportedMediaTypes.add(MediaType.APPLICATION_PDF);
        supportedMediaTypes.add(MediaType.APPLICATION_RSS_XML);
        supportedMediaTypes.add(MediaType.APPLICATION_XHTML_XML);
        supportedMediaTypes.add(MediaType.APPLICATION_XML);
        supportedMediaTypes.add(MediaType.IMAGE_GIF);
        supportedMediaTypes.add(MediaType.IMAGE_JPEG);
        supportedMediaTypes.add(MediaType.IMAGE_PNG);
        supportedMediaTypes.add(MediaType.TEXT_EVENT_STREAM);
        supportedMediaTypes.add(MediaType.TEXT_HTML);
        supportedMediaTypes.add(MediaType.TEXT_MARKDOWN);
        supportedMediaTypes.add(MediaType.TEXT_PLAIN);
        supportedMediaTypes.add(MediaType.TEXT_XML);

        converter.setSupportedMediaTypes(supportedMediaTypes);

        //4 将 Json Convert 添加到 Spring WebMVC converters
        converter.setFastJsonConfig(config);
        converters.add(0, converter);
    }
}
