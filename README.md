# prestodb-sandbox

This sandbox image provides a quick way to run a single-node cluster with the
JMX, [TPC-DS](https://www.tpc.org/tpcds/), [TPC-H](https://www.tpc.org/tpch/),
and memory catalogs.

```
presto> SHOW CATALOGS;
 Catalog
---------
 jmx
 memory
 system
 tpcds
 tpch
(5 rows)
```

Creation of images for new versions of Presto happens autonomously, where a
workflow runs once a day, and if a new version is detected, then it will be
built and pushed, with the `latest` tag pointing at this new version. To
detect a new version, we:

1. Get the latest [tag](https://github.com/prestodb/presto/tags) for regular version
2. Check if that version exists on [maven](https://mvnrepository.com/artifact/com.facebook.presto/presto-main)
3. Check that we do not have a Docker build for that version

If (2) or (3) are not true, then no new build is kicked off.

## Quickstart

### Running the server

To launch the image:

```bash
docker run -p 8080:8080 --name presto ghcr.io/popsql/prestodb-sandbox
```

Wait for the following message log line:

```
INFO	main	com.facebook.presto.server.PrestoServer	======== SERVER STARTED ========
```

### Running the CLI

To use the included CLI:

```bash
docker exec presto -it presto presto
```

You can pass additional arguments to the CLI:

```bash
docker exec presto -it presto presto --catalog tpch --schema sf1
```
