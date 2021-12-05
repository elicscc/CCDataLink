package com.dataqiao.dlt.db;

import com.dataqiao.dlt.db.constant.DatabaseTypeEnum;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Driver;


/**
 * <p>
 * 数据库信息表 服务实现类
 * </p>
 *
 * @author cc
 * @since 2020-08-20
 */
public interface DatabaseService {


    /**
     * 获得连接url
     *
     * @param databaseInfo 数据库信息
     * @return {@link String}
     */
    static String getConnectionUrl(DatabaseInfo databaseInfo) {
        String url;
        String type = databaseInfo.getDatabaseType();
        if (DatabaseTypeEnum.MySQL.getCode().equals(type)) {
            url = "jdbc:mysql://" + databaseInfo.getDatabaseAddress() + ":" + databaseInfo.getPort() + "/" + databaseInfo.getDatabaseName()
                    + "?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true";
        } else if (DatabaseTypeEnum.MariaDB.getCode().equals(type)) {
            url = "jdbc:mariadb://" + databaseInfo.getDatabaseAddress() + ":" + databaseInfo.getPort() + "/" + databaseInfo.getDatabaseName()
                    + "?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowMultiQueries=true";
        } else if (DatabaseTypeEnum.SQLServer.getCode().equals(type)) {
            url = "jdbc:sqlserver://" + databaseInfo.getDatabaseAddress() + ":" + databaseInfo.getPort() + ";database=" + databaseInfo.getDatabaseName();
        } else if (DatabaseTypeEnum.Oracle.getCode().equals(type)) {
            url = "jdbc:oracle:thin:@//" + databaseInfo.getDatabaseAddress() + ":" + databaseInfo.getPort() + "/" + databaseInfo.getDatabaseName() + "?allowMultiQueries=true";
        } else {
            throw new IllegalStateException("Unexpected value: " + databaseInfo.getDatabaseType());
        }
        return url;
    }


    /**
     * 初始化数据源
     *
     * @param driver   司机
     * @param url      url
     * @param username 用户名
     * @param password 密码
     * @return {@link HikariDataSource}
     */
    default HikariDataSource initDataSource(Driver driver, String url, String username, String password) {
        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName(driver.getClass().getName());
        ds.setJdbcUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setMaximumPoolSize(3);
        return ds;
    }


    /**
     * 提交
     */
    default void commit() {
    }

    default Integer executeSql(String sqlStr) {
        return null;
    }

    /**
     * 关闭
     */
    void close();

    /**
     * init sql会话
     */
    default void initSqlSession() {
    }

    /**
     * 获取数据库信息str
     *
     * @return {@link String}
     */
    String getDatabaseInfoStr();

    default String getTableName() {
        return null;
    }

    default String getIsEmpty() {
        return null;
    }
}
