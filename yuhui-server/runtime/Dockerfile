# 基础镜像 (Eclipse Temurin 是 OpenJDK 的官方替代品)
FROM eclipse-temurin:17-jdk-jammy

# 作者

# 配置
ENV JAVA_OPTS=""
ENV PARAMS=""

# 时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN mkdir -p /log/yuhui

# 添加应用
ADD target/yuhui-server.jar /yuhui-server.jar

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /yuhui-server.jar $PARAMS"]