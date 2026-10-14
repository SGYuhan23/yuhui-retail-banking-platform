package com.yuhui.querys.model.valobj;


import lombok.Data;

import java.util.Date;

@Data
public class AwardResponseVO {
    private Long id;
    /**
     * 奖品对接标识（每一个都是一个对应的发奖策略）
     */
    private String awardKey;
    /**
     * 奖品配置信息
     */
    private String awardConfig;
    /**
     * 奖品内容描述
     */
    private String awardDesc;
    /**
     * 奖品图片
     */
    private String image;
    /**
     * 创建时间
     */
    private Date createTime;
    /**
     * 更新时间
     */
    private Date updateTime;
}
