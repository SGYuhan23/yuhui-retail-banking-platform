package com.yuhui.marketing.channel.service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@ServerEndpoint("/ws/{sid}")
@Deprecated
public class ChannelServiceImpl implements ChannelService {

    //根据条件区分所属组
    private static Map<String, Set<Session>> groupMap = new ConcurrentHashMap<>();

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        String group = sid.split("-")[1];
        groupMap.putIfAbsent(group, ConcurrentHashMap.newKeySet());
        groupMap.get(group).add(session);
        log.info("客户端：{}建立连接 所属组：{} 当前组内会话数量：{}", sid, group, groupMap.get(group).size());
    }

    /**
     * 收到客户端消息后调用的方法
     */
    @OnMessage
    public void onMessage(String message, @PathParam("sid") String sid) {
        log.info("收到来自客户端：{}的信息:{} 所属组：{}", sid, message, sid.split("-")[1]);
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose(Session session, @PathParam("sid") String sid) { detach(session,sid); }

    @OnError
    public void onError(Session session, Throwable error, @PathParam("sid") String sid) {
        log.error("Channel session failed sid:{}",sid,error);
        detach(session,sid);
    }

    private void detach(Session session,String sid) {
        String group=sid.split("-")[1];
        Set<Session> sessions=groupMap.get(group);
        if(sessions==null) return;
        sessions.remove(session);
        if(sessions.isEmpty()) groupMap.remove(group);
    }

    @Override
    public void sendToAllClient(String group, String message) {
        Set<Session> sessionSet = groupMap.get(group);
        if (sessionSet == null) {
            return;
        }
        for (Session session : sessionSet) {
            try {
                //服务器向客户端发送消息
                session.getBasicRemote().sendText(message);
            } catch (Exception e) {
                e.printStackTrace();
                log.error("广播消息失败：{}", e.getMessage());
            }
        }
    }
}
