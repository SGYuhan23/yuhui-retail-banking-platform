package com.yuhui.marketing.channel.service;


/**

 * 通信领域
 */
@Deprecated
public interface ChannelService {

    void sendToAllClient(String group,String message);

}
