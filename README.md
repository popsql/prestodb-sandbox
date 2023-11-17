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
