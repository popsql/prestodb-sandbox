FROM amazoncorretto:11-alpine

EXPOSE 8080

ENV PRESTO_HOME=/opt/presto-server

ARG PRESTO_VERSION
ARG PRESTO_PKG=presto-server-${PRESTO_VERSION}.tar.gz
ARG PRESTO_PKG_URL=https://repo1.maven.org/maven2/com/facebook/presto/presto-server/${PRESTO_VERSION}/${PRESTO_PKG}
ARG PRESTO_CLI=presto-cli-${PRESTO_VERSION}-executable.jar
ARG PRESTO_CLI_URL=https://repo1.maven.org/maven2/com/facebook/presto/presto-cli/${PRESTO_VERSION}/${PRESTO_CLI}

RUN apk add --no-cache \
    curl \
    gzip \
    less \
    python3 \
    tar \
  && curl -o ${PRESTO_PKG} ${PRESTO_PKG_URL} \
  && tar -zxf ${PRESTO_PKG} \
  && rm -rf ${PRESTO_PKG} \
  && mv presto-server-${PRESTO_VERSION} ${PRESTO_HOME} \
  && mkdir -p ${PRESTO_HOME}/etc \
  && mkdir -p ${PRESTO_HOME}/etc/catalog \
  && mkdir -p /var/lib/presto/data \
  && curl -o /opt/presto-cli ${PRESTO_CLI_URL} \
  && chmod +x /opt/presto-cli \
  && ln -s /opt/presto-cli /usr/local/bin/presto-cli \
  && ln -s /opt/presto-cli /usr/local/bin/presto \
  && apk del curl tar

ADD etc /opt/presto-server/etc/

WORKDIR /opt/presto-server
CMD ["/bin/sh", "-c", "./bin/launcher run"]
