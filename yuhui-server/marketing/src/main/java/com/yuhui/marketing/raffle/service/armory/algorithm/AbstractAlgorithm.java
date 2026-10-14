package com.yuhui.marketing.raffle.service.armory.algorithm;


import java.security.SecureRandom;

/**

 * 装配/抽奖算法抽象类
 */
public abstract class AbstractAlgorithm implements Algorithm {
    protected final SecureRandom secureRandom = new SecureRandom();


}
