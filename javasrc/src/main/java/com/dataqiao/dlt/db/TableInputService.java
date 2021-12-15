package com.dataqiao.dlt.db;

import com.dataqiao.dlt.db.constant.*;
import com.dataqiao.dlt.db.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.dbutils.handlers.BeanListHandler;

import java.io.IOException;
import java.sql.*;
import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

import static com.dataqiao.dlt.db.constant.DatabaseTypeEnum.Oracle;

/**
 * 表输入服务，执行sql语句，查询表，查询列
 *
 * @author cc
 * @date 2021/04/22
 */
@Slf4j
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
        } catch (Exception e) {
            return JsonResult.error(e.getMessage());
        }
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


    public String getTableNames(String databaseInfoStr) {
        try {
            return JsonResult.success(getTables(databaseInfoStr));
        } catch (RuntimeException e) {
            return JsonResult.error(e.getMessage());
        }
    }

    /**
     * 获取表
     *
     * @param databaseInfoStr
     * @return
     */
    public List<NameCommentVo> getTables(String databaseInfoStr) {
        List<NameCommentVo> tableModelVos;
        String sql;
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        switch (databaseInfo.getDatabaseType()) {
            case "1":
            case "4":
                sql = "SELECT table_name name,TABLE_COMMENT cm FROM INFORMATION_SCHEMA.TABLES  WHERE table_schema = '" + databaseInfo.getDatabaseName() + "' ORDER BY table_name";
                break;
            case "2":
                sql = "SELECT TABLE_NAME name, TABLE_TYPE cm FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME";
                break;
            case "3":
                sql = "select TABLE_NAME name ,COMMENTS  cm from user_tab_comments ORDER BY TABLE_NAME";
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
            case "2":
                sql = "SELECT  TABLE_NAME tableName, COLUMN_NAME columnName, DATA_TYPE  columnType FROM INFORMATION_SCHEMA.COLUMNS";
                break;
            case "3":
                sql = "SELECT TABLE_NAME as \"tableName\", COLUMN_NAME as \"columnName\" , DATA_TYPE as \"columnType\" FROM ALL_TAB_COLUMNS WHERE TABLE_NAME in  (select TABLE_NAME from user_tab_comments)";
                break;
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

//    public static void main(String[] args) {
//
//        String database = "{\"connectName\":\"oracle\",\"databaseType\":\"3\",\"databaseAddress\":\"172.16.10.70\",\"databaseName\":\"center\",\"port\":\"1521\",\"username\":\"sjz\",\"password\":\"sjz@2020\",\"databaseDescription\":\"\",\"id\":\"4ce41570-5d6c-11ec-be8f-67031276b348\"}";
//
//        String sql = "SELECT TABLE_NAME as tableName, COLUMN_NAME as columnName , DATA_TYPE as columnType FROM ALL_TAB_COLUMNS  WHERE OWNER = 'SJZ';SELECT TABLE_NAME as tableName, COLUMN_NAME as columnName , DATA_TYPE as columnType FROM ALL_TAB_COLUMNS  WHERE OWNER = 'SJZ';";
//
//        TableInputService s = new TableInputService();
//        String sss = s.exeSql(database, sql, "sss");
//        System.out.println(sss);
//
//    }

    public String exeSql(String databaseInfoStr, String sql, String id) {
        try {
            return JsonResult.success(executeSql(databaseInfoStr, sql, id));
        } catch (RuntimeException e) {
            QuerySqlVo s = new QuerySqlVo();
            s.setErrorMessage(e.getMessage());
            s.setSql(sql);
            s.setId(id);
            return JsonResult.success(s);
        }
    }


    public QuerySqlVo executeSql(String databaseInfoStr, String sqlStr, String id) {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        //oracle的sql需要支持分号

        ResultSet rs;
        String sql = sqlStr.trim();
        if (Oracle.getCode().equals(databaseInfo.getDatabaseType())) {
            sql = sql.endsWith(";") ? sql.substring(0, sql.length() - 1) : sql;
        }
        int count = 0;
        boolean label = true;
        List<IViewTableVo> s = new ArrayList<>();
        try (Connection conn = getConnection(databaseInfo)) {
            Statement stmt = conn.createStatement();
            stmt.setQueryTimeout(300);
            // 获取开始时间
            long startTime = System.currentTimeMillis();
            stmt.execute(sql);
            while (label) {
                int i = stmt.getUpdateCount();
                boolean upLabel = false;
                if (i != -1) {
                    count += i;
                    continue;
                }
                rs = stmt.getResultSet();
                if (rs != null) {
                    ResultSetMetaData data = rs.getMetaData();
                    int columnCount = data.getColumnCount();
                    List<ColumnVo> columns = new ArrayList<>();
                    List<Map<String, String>> dataList = new ArrayList<>();
                    for (int f = 0; f < columnCount; f++) {
                        ColumnVo columnVo = new ColumnVo();
                        columnVo.setKey(data.getColumnName(f + 1));
                        columnVo.setTitle(data.getColumnName(f + 1));
                        columnVo.setResizable(true);
                        columnVo.setEllipsis(true);
                        columnVo.setTooltip(true);
                        columnVo.setWidth(300);
                        columns.add(columnVo);
                    }
                    while (rs.next()) {
                        Map<String, String> v = new HashMap<>(16);
                        for (int j = 0; j < data.getColumnCount(); j++) {
                            String value = data.getColumnTypeName(j + 1).toUpperCase().contains("IMAGE") || data.getColumnTypeName(j + 1).toUpperCase().contains("BLOB") ? getBlob(rs.getBlob(j + 1)) : rs.getString(j + 1);
                            v.put(data.getColumnName(j + 1), value);
                        }
                        dataList.add(v);
                    }
                    IViewTableVo iViewTableVo = new IViewTableVo();
                    iViewTableVo.setColumns(columns);
                    iViewTableVo.setDataList(dataList);
                    s.add(iViewTableVo);
                    // oracle不支持多条sql执行需要返回
                    if (Oracle.getCode().equals(databaseInfo.getDatabaseType())) {
                        label = false;
                        continue;
                    }
                    stmt.getMoreResults();
                    continue;
                }
                label = upLabel;
            }
            // 获取结束时间
            long endTime = System.currentTimeMillis();
            long methodTime = (endTime - startTime) / 1000;
            DecimalFormat df2 = new DecimalFormat("0.###");
            QuerySqlVo querySqlVo = new QuerySqlVo();
            querySqlVo.setTime(df2.format(methodTime) + "s");
            querySqlVo.setSql(sql);
            querySqlVo.setId(id);
            if (count > 0) {
                querySqlVo.setCount(count);
            }
            querySqlVo.setResultSet(s);
            return querySqlVo;
        } catch (SQLTimeoutException e) {
            throw new RuntimeException("执行sql异常，数据库超时>300s");
        } catch (SQLException | IOException e) {
            log.error("数据库报错：", e);
            throw new RuntimeException(e.getMessage());
        }

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
