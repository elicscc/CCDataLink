package com.cc.dlt.db;

import com.cc.dlt.db.constant.*;
import com.cc.dlt.db.constant.*;
import com.cc.dlt.db.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.dbutils.handlers.BeanListHandler;

import java.io.IOException;
import java.sql.*;
import java.text.DecimalFormat;
import java.util.*;
import java.util.stream.Collectors;

import static com.cc.dlt.db.constant.DatabaseTypeEnum.Oracle;

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


    public String getTablePage(String databaseInfoStr, String tableName, Integer num, Integer size) {
        try {
            return JsonResult.success(getTablePageService(databaseInfoStr, tableName, num, size));
        } catch (RuntimeException e) {
            return JsonResult.error(e.getMessage());
        }
    }


    public String getTableLastPage(String databaseInfoStr, String tableName, Integer size) {
        try {
            return JsonResult.success(getTableLastPageService(databaseInfoStr, tableName, size));
        } catch (RuntimeException e) {
            return JsonResult.error(e.getMessage());
        }
    }

    /**
     * SELECT * FROM `data_link_transfer_5`.`t_online_class_info` LIMIT 0,1000
     * <p>
     * SHOW CREATE TABLE `data_link_transfer_5`.`t_collect_log`
     * <p>
     * SHOW CREATE TABLE `data_link_transfer_5`.`t_online_class_info`
     *
     * @param databaseInfoStr
     * @param tableName
     * @param num
     * @param size
     * @return
     */
    public TableListVo getTablePageService(String databaseInfoStr, String tableName, Integer num, Integer size) {
        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        if (null == databaseInfo) {
            throw new RuntimeException("数据库不存在！");
        }
        List<Map<String, String>> dataList = new ArrayList<>();
        List<Map<String, String>> columnInfo = new ArrayList<>();
        String showColumnsSql, selectSql;
        String databaseAndTableName = "`" + databaseInfo.getDatabaseName() + "`.`" + tableName + "`";
        switch (databaseInfo.getDatabaseType()) {
            case "1":
            case "4":
                showColumnsSql = "SHOW COLUMNS FROM " + databaseAndTableName;
                selectSql = "SELECT * FROM " + databaseAndTableName + " LIMIT " + num + "," + size;
                break;
            default:
                throw new RuntimeException("Unexpected value: " + databaseInfo.getDatabaseType());
        }
        try (Connection conn = getConnection(databaseInfo)) {


            Statement stmt = conn.createStatement();
            stmt.setQueryTimeout(300);
            stmt.execute(selectSql);
            ResultSet rs = stmt.getResultSet();
            ResultSetMetaData data = rs.getMetaData();
            while (rs.next()) {
                Map<String, String> v = new HashMap<>(16);
                for (int j = 0; j < data.getColumnCount(); j++) {
                    String value = data.getColumnTypeName(j + 1).toUpperCase().contains("IMAGE") || data.getColumnTypeName(j + 1).toUpperCase().contains("BLOB") ? getBlob(rs.getBlob(j + 1)) : rs.getString(j + 1);
                    v.put(data.getColumnName(j + 1), value);
                }
                dataList.add(v);
            }
            stmt.execute(showColumnsSql);
            rs = stmt.getResultSet();
            data = rs.getMetaData();
            while (rs.next()) {
                Map<String, String> v = new HashMap<>(16);
                for (int j = 0; j < data.getColumnCount(); j++) {
                    String value = data.getColumnTypeName(j + 1).toUpperCase().contains("IMAGE") || data.getColumnTypeName(j + 1).toUpperCase().contains("BLOB") ? getBlob(rs.getBlob(j + 1)) : rs.getString(j + 1);
                    v.put(data.getColumnName(j + 1), value);
                }
                columnInfo.add(v);
            }

            TableListVo vo = new TableListVo();
            vo.setColumnInfo(columnInfo);
            vo.setDataList(dataList);
            return vo;
        } catch (SQLTimeoutException e) {
            throw new RuntimeException("执行sql异常，数据库超时>300s");
        } catch (SQLException | IOException e) {
            log.error("数据库报错：", e);
            throw new RuntimeException(e.getMessage());
        }
    }

//    public static void main(String[] args) {
//        String s="{\"connectName\":\"ss\",\"databaseType\":\"1\",\"databaseAddress\":\"localhost\",\"databaseName\":\"mx\",\"port\":\"3306\",\"username\":\"root\",\"password\":\"root\",\"databaseDescription\":\"\",\"id\":\"25ed3850-5be3-11ec-a23b-f10da0c8ac8e\",\"isConnected\":true}";
//        TableInputService tableInputService = new TableInputService();
//        tableInputService.getTablePageService(s,"ok",0,1000);
//    }
//
    public String getTableLastPageService(String databaseInfoStr, String tableName, Integer size) {
        return null;
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


}
