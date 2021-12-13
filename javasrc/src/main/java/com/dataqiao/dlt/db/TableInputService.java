package com.dataqiao.dlt.db;

import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.dataqiao.dlt.db.constant.*;
import com.dataqiao.dlt.db.util.JsonUtil;
import org.apache.commons.dbutils.handlers.BeanListHandler;

import java.io.IOException;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import static com.dataqiao.dlt.db.constant.DatabaseTypeEnum.Oracle;

/**
 * 表输入服务，执行sql语句，查询表，查询列
 *
 * @author cc
 * @date 2021/04/22
 */
public class TableInputService {

    /**
     * 测试数据库连接
     *
     * @param databaseInfoStr
     * @return
     */
    public String testConnect(String databaseInfoStr) {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        try (Connection conn = getConnection(databaseInfo)) {
            conn.isValid(30);
            return JsonResult.success();
        } catch (SQLException e) {
            return JsonResult.error(e.getMessage());
        }
    }


    public String formatSqlWithInput(String databaseInfoStr, String sql) {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        sql = sql.trim();
        sql = sql.endsWith(";") ? sql.substring(0, sql.length() - 1) : sql;
        // 不套子查询了,别名解析不了的问题先不管
//        if (DatabaseTypeEnum.MySQL.getCode().equals(databaseInfo.getDatabaseType())) {
//            sql = "select * from (" + sql + ") dataqiao";
//        }
        return sql;
    }

    /**
     * 表输入组件用
     *
     * @param databaseInfoStr
     * @param sql
     * @param fetchSize
     * @return
     * @throws SQLException
     */
    public TableInputDto selectTableInputData(String databaseInfoStr, String sql, Integer fetchSize) throws SQLException {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        //oracle的sql需要支持分号
        if (Oracle.getCode().equals(databaseInfo.getDatabaseType())) {
            sql = sql.trim();
            sql = sql.endsWith(";") ? sql.substring(0, sql.length() - 1) : sql;
        }
        if (null == fetchSize) {
            fetchSize = 2000;
        }
        Connection conn = getConnection(databaseInfo);
        Statement sm = conn.createStatement();
        sm.setFetchSize(fetchSize);
        ResultSet resultSet = sm.executeQuery(sql);
        TableInputDto d = new TableInputDto();
        d.setResultSet(resultSet);
        d.setConn(conn);
        return d;
    }

    public String getBlob(Blob blob) throws SQLException, IOException {
        if (null == blob) {
            return null;
        }
        byte[] data = blob.getBytes(1, (int) blob.length());
        return new String(data);
    }


    public String getTableNames(String databaseInfoStr, String tableName) {
        try {
            return JsonResult.success(getTables(databaseInfoStr, tableName));
        } catch (RuntimeException e) {
            return JsonResult.error(e.getMessage());
        }
    }

    /**
     * 获取表
     *
     * @param databaseInfoStr
     * @param tableName
     * @return
     */
    public List<NameCommentVo> getTables(String databaseInfoStr, String tableName) {
        if (StringUtils.isBlank(tableName)) {
            tableName = "";
        }
        List<NameCommentVo> tableModelVos;
        String sql;
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        switch (databaseInfo.getDatabaseType()) {
            case "1":
            case "4":
                sql = "SELECT table_name name,TABLE_COMMENT cm FROM INFORMATION_SCHEMA.TABLES  WHERE table_schema = '" + databaseInfo.getDatabaseName() + "' and table_name like concat('%','" + tableName + "','%')";
                break;
            case "2":
                sql = "SELECT Name name,Name cm FROM SysObjects where Name like '%" + tableName + "%'";
                break;
            case "3":
                sql = "select TABLE_NAME name ,COMMENTS  cm from user_tab_comments where TABLE_NAME like '%" + tableName + "%'";
                break;
            default:
                throw new RuntimeException("Unexpected value: " + databaseInfo.getDatabaseType());
        }
        try (Connection conn = getConnection(databaseInfo)) {
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet resultSet = ps.executeQuery();
            BeanListHandler<NameCommentVo> beanListHandler = new BeanListHandler<>(NameCommentVo.class);
            tableModelVos = beanListHandler.handle(resultSet);
        } catch (SQLException e) {
            throw new RuntimeException("获取表信息失败" + e.getMessage());
        }
        return tableModelVos;
    }

    public String getTableAndColumns(String databaseInfoStr) {
        try {
            return JsonResult.success(getTablesAndColumns(databaseInfoStr));
        } catch (RuntimeException e) {
            return JsonResult.error(e.getMessage());
        }
    }


    public Map<String, List<String>> getTablesAndColumns(String databaseInfoStr) {

        List<TablesAndColumnsVo> tableModelVos;
        String sql;
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        switch (databaseInfo.getDatabaseType()) {
            case "1":
            case "4":
                sql = "SELECT  TABLE_NAME tableName, COLUMN_NAME columnName, COLUMN_TYPE columnType FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '" + databaseInfo.getDatabaseName() + "'";
                break;
//            case "2":
//                sql = "SELECT Name name,Name cm FROM SysObjects where Name like '%" + tableName + "%'";
//                break;
//            case "3":
//                sql = "select TABLE_NAME name ,COMMENTS  cm from user_tab_comments where TABLE_NAME like '%" + tableName + "%'";
//                break;
            default:
                throw new RuntimeException("Unexpected value: " + databaseInfo.getDatabaseType());
        }
        try (Connection conn = getConnection(databaseInfo)) {
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet resultSet = ps.executeQuery();
            BeanListHandler<TablesAndColumnsVo> beanListHandler = new BeanListHandler<>(TablesAndColumnsVo.class);
            tableModelVos = beanListHandler.handle(resultSet);
        } catch (SQLException e) {
            throw new RuntimeException("获取信息失败：" + e.getMessage());
        }
        if (tableModelVos.isEmpty()) {
            return null;
        } else {
            return tableModelVos.stream().collect(Collectors.groupingBy(TablesAndColumnsVo::getTableName, Collectors.mapping(TablesAndColumnsVo::getColumnName, Collectors.toList())));
        }
    }


    private IViewTableVo selectTableInput(DatabaseInfo databaseInfo, String sql) {
        List<ColumnVo> columns = new ArrayList<>();
        List<Map<String, String>> dataList = new ArrayList<>();
        try (Connection conn = getConnection(databaseInfo)) {
            Statement sm = conn.createStatement();
            ResultSet rs = sm.executeQuery(sql);
            ResultSetMetaData data = rs.getMetaData();
            for (int i = 0; i < data.getColumnCount(); i++) {
                ColumnVo columnVo = new ColumnVo();
                columnVo.setKey(data.getColumnName(i + 1));
                columnVo.setTitle(data.getColumnName(i + 1));
                columns.add(columnVo);
            }
            while (rs.next()) {
                Map<String, String> v = new HashMap<>(16);
                for (int i = 0; i < data.getColumnCount(); i++) {
                    String value;
                    value = data.getColumnTypeName(i + 1).toUpperCase().contains("IMAGE") || data.getColumnTypeName(i + 1).toUpperCase().contains("BLOB") ? getBlob(rs.getBlob(i + 1)) : rs.getString(i + 1);
                    v.put(data.getColumnName(i + 1), value);
                }
                dataList.add(v);
            }
            IViewTableVo iViewTableVo = new IViewTableVo();
            iViewTableVo.setColumns(columns);
            iViewTableVo.setDataList(dataList);
            return iViewTableVo;
        } catch (SQLException | IOException e) {
            throw new RuntimeException("获取信息失败" + e.getMessage());
        }
    }


    private Connection getConnection(DatabaseInfo databaseInfo) {
        String url = DatabaseService.getConnectionUrl(databaseInfo);
        try {
            Properties p = new Properties();
            p.setProperty("user", databaseInfo.getUsername());
            p.setProperty("password", databaseInfo.getPassword());
            p.setProperty("remarks", "true");
            p.setProperty("useInformationSchema", "true");
            return DriverManager.getConnection(url, p);
        } catch (SQLException e) {
            throw new RuntimeException("连接失败" + e.getMessage());
        }
    }


    public static void main(String[] args) {
        new TableInputService().executeSql(JsonUtil.toJsonString(new DatabaseInfo().setDatabaseType("4").setDatabaseName("mx").setDatabaseAddress("localhost").setPort(3306).setUsername("root").setPassword("root"))
                , "select * from t_mx;INSERT INTO t_mx (id)  VALUES(29)");
    }

    public Integer executeSql(String databaseInfoStr, String sqlStr) {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        ResultSet rs = null;
        int tag = 0;
        int count = 0;
        boolean label = true;
        try (Connection conn = getConnection(databaseInfo)) {
            Statement stmt = conn.createStatement();
            stmt.setQueryTimeout(300);
            stmt.execute(sqlStr.trim());
            while (label) {
                int i = 0;
                i = stmt.getUpdateCount();
                boolean up_label = false;
                if (i != -1) {
                    up_label = stmt.getMoreResults();
                    continue;
                }
                boolean flag_label = false;
                rs = stmt.getResultSet();
                if (rs != null) {
                    ResultSetMetaData rsmd = rs.getMetaData();
                    int columnCount = rsmd.getColumnCount();
                    tag++;
                    if (tag == 1) {
                        while (rs.next()) {
                        }

                    } else if (tag == 2) {
                        while (rs.next()) {
                        }
                    }
                    flag_label = stmt.getMoreResults();
                    continue;
                }
                label = up_label || flag_label;
            }
        } catch (SQLTimeoutException e) {
            throw new RuntimeException("执行sql异常，数据库超时>300s");
        } catch (SQLException e) {
            throw new RuntimeException("执行sql异常，数据库报错：" + e.getMessage());
        }
        return null;
    }


    /**
     * 查询表结构
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SHOW TABLE STATUS LIKE 't\_mx'
     * Time: 0.000s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SHOW CREATE TABLE `t_mx`
     * Time: 0.000s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SHOW FULL COLUMNS FROM `t_mx`
     * Time: 0.024s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SHOW INDEX FROM `t_mx`
     * Time: 0.001s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SELECT action_order, event_object_table, trigger_name, event_manipulation, event_object_table, definer, action_statement, action_timing FROM information_schema.triggers WHERE BINARY event_object_schema = 'mx' AND BINARY event_object_table = 't_mx' ORDER BY event_object_table
     * Time: 0.014s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SELECT TABLE_NAME, PARTITION_NAME, SUBPARTITION_NAME, PARTITION_METHOD, SUBPARTITION_METHOD, PARTITION_EXPRESSION, SUBPARTITION_EXPRESSION, PARTITION_DESCRIPTION, PARTITION_COMMENT, NODEGROUP, TABLESPACE_NAME FROM information_schema.PARTITIONS WHERE NOT ISNULL(PARTITION_NAME) AND TABLE_SCHEMA LIKE 'mx' AND TABLE_NAME LIKE 't_mx' ORDER BY TABLE_NAME, PARTITION_NAME, PARTITION_ORDINAL_POSITION, SUBPARTITION_ORDINAL_POSITION
     * Time: 0.015s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA
     * Time: 0.001s
     *
     * [2021-12-12 14:28:17][localhost_3306][92][MARIADB]
     * SELECT DISTINCT(TABLESPACE_NAME) AS TABLESPACE_NAME FROM information_schema.FILES WHERE NOT ISNULL(TABLESPACE_NAME) LIMIT 10000
     * Time: 0.000s
     */


}
