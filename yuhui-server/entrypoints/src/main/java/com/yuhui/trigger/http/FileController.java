package com.yuhui.trigger.http;

import com.yuhui.types.annotation.PermissionCheck;
import com.yuhui.types.enums.ResponseCode;
import com.yuhui.types.model.BaseResponse;
import com.yuhui.types.util.AliOSSUtils;
import com.yuhui.types.util.MinIOUtils;
import io.minio.errors.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@RestController
@RequestMapping("/file")
@CrossOrigin("*")
@Slf4j
public class FileController {

    @Autowired
    private AliOSSUtils aliOSSUtils;
//    @Autowired
//    private MinIOUtils minIOUtils;

    /**
     * 文件上传
     * @param file 文件
     * @return url
     * @throws IOException io
     */
    @PostMapping("/upload")
    @PermissionCheck(roles = {"ROLE_ADMIN"})
    public BaseResponse<String> upload(MultipartFile file) throws IOException, ServerException, InsufficientDataException, ErrorResponseException, NoSuchAlgorithmException, InvalidKeyException, InvalidResponseException, XmlParserException, InternalException {
        log.info("文件上传，文件名:{}",file.getOriginalFilename());
        //调用阿里云OSS工具类进行上传
        String url = aliOSSUtils.upload(file);
        log.info("文件上传成功，文件访问地址为：{}",url);
        return new BaseResponse<>(ResponseCode.SUCCESS.getCode(), url);
    }

}
