package com.dataqiao.dlt.db.util.tableimport;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisSqlSessionFactoryBuilder;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.logging.slf4j.Slf4jImpl;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

/**
 * sql执行程序
 *
 * @author cc
 * @date 2021/04/19
 */
public class SqlExecutor {
    private final MemoryClassLoader memoryClassLoader;
    private final HikariDataSource dataSource;
    private final String packagePath;

    /**
     * sql执行程序
     *
     * @param packagePath 包的路径
     * @param dataSource  数据源
     */
    public SqlExecutor(String packagePath, HikariDataSource dataSource) {
        this.packagePath = packagePath;
        this.dataSource = dataSource;
        this.memoryClassLoader = new MemoryClassLoader(packagePath);
    }


    /**
     * 获得会话
     * 根据表名和数据库类型,自动生成java文件并实时编译生成.class文件
     *
     * @param tableName 表名
     * @param dbType    db型
     * @return {@link SqlSession}
     * @throws Exception 异常
     */
    public SqlSessionFactory getSessionFactory(String tableName, String dbType) throws Exception {

        MyGenerate myGenerate = new MyGenerate();
        myGenerate.setTemplateEngine(new MyTemplateEngine());
        // 生成class文件
        myGenerate.generateClass(packagePath, dataSource, tableName, dbType);

        return initSqlSessionFactory(tableName);
    }

    /**
     * 得到实体类
     *
     * @param tableName 表名
     * @return {@link Class>}
     */
    public Class<?> getEntityClass(String tableName) throws ClassNotFoundException {
        return Class.forName("entity." + NamingStrategy.capitalFirst(tableName), true, memoryClassLoader);
    }

    public Class<?> getMapperClass(String tableName) throws ClassNotFoundException {
        return Class.forName("mapper." + NamingStrategy.capitalFirst(tableName) + "Mapper", true, memoryClassLoader);
    }

    private SqlSessionFactory initSqlSessionFactory(String tableName) throws ClassNotFoundException {
        TransactionFactory transactionFactory = new JdbcTransactionFactory();
        Environment environment = new Environment("Production", transactionFactory, dataSource);
        MybatisConfiguration configuration = new MybatisConfiguration(environment);
        Class<?> mapperClass = getMapperClass(tableName);

        configuration.addMapper(mapperClass);
        configuration.setLogImpl(Slf4jImpl.class);
        // 增大超时时间
        configuration.setDefaultStatementTimeout(60 * 60 * 24);
        configuration.setMapUnderscoreToCamelCase(false);
        return new MybatisSqlSessionFactoryBuilder().build(configuration);
    }
}
