package com.dataqiao.dlt.db;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dataqiao.dlt.db.util.JsonUtil;
import com.dataqiao.dlt.db.util.tableimport.SqlExecutor;
import com.zaxxer.hikari.HikariDataSource;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;

import java.io.File;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.sql.*;
import java.util.List;
import java.util.Map;


/**
 * <p>
 * 数据库信息表 服务实现类
 * </p>
 *
 * @author cc
 * @since 2020-08-20
 */
@Slf4j
public class TableOutputService implements DatabaseService{

    private String cachePath;
    private final Constructor<?> constructor;
    private final Map<String, Field> fieldMapByClass;
    private BaseMapper<Object> mapper;
    private final SqlSessionFactory sessionFactory;
    private SqlSession session;
    private final HikariDataSource dataSource;
    private final DataBaseServiceCache.CacheKey cacheKey;
    private int insertCount = 0;
    public final String tableName;
    private final String databaseInfoStr;
    private final Class<?> mapperClass;
    private String isEmpty;

    private void initCachePath(String cachePath) {
        File cache = new File("cachePath");
        if (!cache.exists()) {
            cache.mkdir();
        }
        File java = new File(cachePath, "java");
        if (!java.exists()) {
            java.mkdir();
        }
        this.cachePath = java.getAbsolutePath() + File.separator;
    }

    /**
     * 获取数据库表的BaseMapper,node会调用此方法
     *
     * @param databaseInfoStr 数据库信息
     * @param tableName       表名
     * @param isEmpty         是否为空
     */
    public TableOutputService(String databaseInfoStr, String tableName, String isEmpty, String cachePath, DataBaseServiceCache.CacheKey cacheKey) {
        initCachePath(cachePath);
        this.cacheKey = cacheKey;
        this.databaseInfoStr = databaseInfoStr;
        this.tableName = tableName;
        this.isEmpty = isEmpty;

        DatabaseInfo databaseInfo = JsonUtil.parseObject(databaseInfoStr, DatabaseInfo.class);
        try {
            String dbType = databaseInfo.getDatabaseType();
            String url = DatabaseService.getConnectionUrl(databaseInfo);
            String username = databaseInfo.getUsername();
            String password = databaseInfo.getPassword();
            Driver driver = DriverManager.getDriver(url);
            this.dataSource = initDataSource(driver, url, username, password);

            SqlExecutor sqlExecutor = new SqlExecutor(this.cachePath, dataSource);
            this.sessionFactory = sqlExecutor.getSessionFactory(tableName, dbType);
            this.mapperClass = sqlExecutor.getMapperClass(tableName);
            Class<?> entityClass = sqlExecutor.getEntityClass(tableName);

            this.constructor = entityClass.getConstructor();
            this.fieldMapByClass = JsonUtil.getFieldMapByClass(entityClass);

        } catch (Exception e) {
            log.error("表输出异常，数据库报错：", e);
            throw new RuntimeException("表输出异常，数据库报错：" + e.getMessage());
        }
    }

    /**
     * 清空表
     *
     * @param tableName 表名
     * @throws SQLException sqlexception异常
     */
    @SneakyThrows
    private void truncateTable(String tableName) {
        Connection connection = this.session.getConnection();
        try (Statement statement = connection.createStatement()){
            statement.execute("truncate table " + tableName);
        }
    }

    /**
     * 插入一条数据,node会调用此方法
     *
     * @param insertData 插入数据
     */
    public void insert(List<Object[]> insertData) {
        try {
            Object o = JsonUtil.mapToDatabaseEntity(insertData, this.constructor, this.fieldMapByClass);
            if (o != null) {
                this.mapper.insert(o);
            }
            if (insertCount % 2000 == 0) {
                this.session.commit();
            }
            insertCount++;
        } catch (Exception e) {
            log.error("表输出异常，数据库报错：", e);
            throw new RuntimeException("表输出异常，数据库报错：" + e.getMessage());
        }
    }

    /**
     * 连接sqlSession
     */
    @Override
    @SuppressWarnings("unchecked")
    public void initSqlSession() {
        this.session = this.sessionFactory.openSession();
        this.mapper = (BaseMapper<Object>) session.getMapper(this.mapperClass);
        // 清空表数据
//        if (CommonConstant.EMPTY_YES.equals(isEmpty)) {
//            truncateTable(tableName);
//        }
    }

    /**
     * 提交
     */
    @Override
    public void commit() {
        this.session.commit();
        try {
            this.session.close();
        } catch (Exception e) {
            log.error("close session error, task run uuid is {}", this.cacheKey, e);
        }
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

    @Override
    public String getTableName() {
        return tableName;
    }

    @Override
    public String getIsEmpty() {
        return isEmpty;
    }
}
