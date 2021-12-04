package com.dataqiao.dlt.db;

import com.dataqiao.dlt.db.util.JsonUtil;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;

import java.sql.*;

import static com.dataqiao.dlt.db.DatabaseService.getConnectionUrl;


/**
 * <p>
 * 数据库信息表 服务实现类
 * </p>
 *
 * @author cc
 * @since 2020-08-20
 */
@Slf4j
public class ExecuteSqlService implements DatabaseService {

    private final HikariDataSource dataSource;
    private final DataBaseServiceCache.CacheKey cacheKey;
    private final String databaseInfoStr;


    /**
     * 执行sql服务
     * 获取数据库表的BaseMapper,node会调用此方法
     *
     * @param databaseInfoStr 数据库信息
     * @param cacheKey        缓存键
     */
    public ExecuteSqlService(String databaseInfoStr, DataBaseServiceCache.CacheKey cacheKey) {
        this.cacheKey = cacheKey;
        this.databaseInfoStr = databaseInfoStr;

        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        try {
            String url = getConnectionUrl(databaseInfo);
            String username = databaseInfo.getUsername();
            String password = databaseInfo.getPassword();
            Driver driver = DriverManager.getDriver(url);
            this.dataSource = initDataSource(driver, url, username, password);

        } catch (Exception e) {
            log.error("表输出异常，数据库报错：", e);
            throw new RuntimeException("表输出异常，数据库报错：" + e.getMessage());
        }
    }

    /**
     * 执行sql组件用
     *
     * @param sqlStr sql str
     * @return {@link Integer}
     */
    @Override
    public Integer executeSql(String sqlStr) {
        int count = 0;
        try (Connection conn = this.dataSource.getConnection()) {
            //获取连接后，立刻禁用事务的自动提交，相当于开启一个事务
            conn.setAutoCommit(false);
            Statement stmt = conn.createStatement();
            stmt.setQueryTimeout(300);
            boolean isQuery = stmt.execute(sqlStr.trim());
            if (!isQuery) {
                count += stmt.getUpdateCount();
            }
            conn.commit();
        } catch (SQLTimeoutException e) {
            throw new RuntimeException("执行sql异常，数据库超时>300s");
        } catch (SQLException e) {
            throw new RuntimeException("执行sql异常，数据库报错：" + e.getMessage());
        }
        return count;
    }

    /**
     * 关闭
     */
    @Override
    public void close() {

        try {
            this.dataSource.close();
        } catch (Exception e) {
            log.error("close dataSource error task run uuid is {}", this.cacheKey, e);

        }
    }

    @Override
    public String getDatabaseInfoStr() {
        return databaseInfoStr;
    }
}
