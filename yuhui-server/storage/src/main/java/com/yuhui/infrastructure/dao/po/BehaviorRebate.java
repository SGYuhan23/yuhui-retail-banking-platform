package com.yuhui.infrastructure.dao.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 返利活动配置表

 * @TableName behavior_rebate
 */
@TableName(value ="behavior_rebate")
@Data
public class BehaviorRebate implements Serializable {
    /**
     * 雪花ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 行为类型（sign 签到、openai_pay 支付、activity_gift 活动赠送）
     */
    private String behaviorType;

    /**
     * 返利描述
     */
    private String rebateDesc;

    /**
     * 返利类型（sku 充值抽奖次数、integral 用户活动积分 ,gift 活动赠送抽奖次数）
     */
    private String rebateType;

    /**
     * 返利配置
     */
    private String rebateConfig;

    /**
     * 状态（open 开启、close 关闭）
     */
    private String state;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    @Serial
    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}