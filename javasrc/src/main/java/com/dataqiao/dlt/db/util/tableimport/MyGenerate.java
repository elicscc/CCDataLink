package com.dataqiao.dlt.db.util.tableimport;


import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.config.*;
import com.baomidou.mybatisplus.generator.config.builder.ConfigBuilder;
import com.baomidou.mybatisplus.generator.config.converts.MySqlTypeConvert;
import com.baomidou.mybatisplus.generator.config.converts.OracleTypeConvert;
import com.baomidou.mybatisplus.generator.config.converts.SqlServerTypeConvert;
import com.baomidou.mybatisplus.generator.config.rules.DbColumnType;
import com.baomidou.mybatisplus.generator.config.rules.IColumnType;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;
import com.dataqiao.dlt.db.constant.DatabaseTypeEnum;
import com.zaxxer.hikari.HikariDataSource;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;

/**
 * 我的生成
 *
 * @author cc
 * @date 2021/04/19
 */
@Slf4j
@EqualsAndHashCode(callSuper = true)
@Data
@Accessors(chain = true)
public class MyGenerate extends AutoGenerator {

    public void generateClass(String packagePath, HikariDataSource dataSource, String tableName, String dbType) throws Exception {
        DataSourceConfig dataSourceConfig = new DataSourceConfig();
        dataSourceConfig.setUrl(dataSource.getJdbcUrl())
                .setUsername(dataSource.getUsername())
                .setPassword(dataSource.getPassword())
                .setTypeConvert(getTypeConvert(dbType))
                .setDriverName(dataSource.getDriverClassName());
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setAuthor("dataqiao");
        PackageConfig packageConfig = new PackageConfig().setParent("");
        StrategyConfig strategyConfig = new StrategyConfig();
        strategyConfig.setEntityLombokModel(false)
                .setNaming(NamingStrategy.no_change)
                .setEntityTableFieldAnnotationEnable(true)
                .setInclude(tableName);
        // 初始化配置
        if (null == config) {
            config = new ConfigBuilder(packageConfig, dataSourceConfig, strategyConfig, super.getTemplate(), globalConfig);
        }
        // 模板引擎初始化执行文件输出
        MyTemplateEngine templateEngine = (MyTemplateEngine) super.getTemplateEngine().init(this.pretreatmentConfigBuilder(config));
        templateEngine.generate(packagePath, dbType);
    }

    /**
     * 得到类型转换 by database type,oracle的blob需要使用byte[]类型来处理
     *
     * @param dbType db型
     * @return {@link ITypeConvert}
     */
    private ITypeConvert getTypeConvert(String dbType) {
        if (dbType.equals(DatabaseTypeEnum.MySQL.getCode())) {
            return new MySqlTypeConvert() {
                @Override
                public IColumnType processTypeConvert(GlobalConfig globalConfig, String t) {
                    if (t.toLowerCase().contains("blob")) {
                        return DbColumnType.STRING;
                    }
                    return super.processTypeConvert(globalConfig, t);
                }
            };
        } else if (dbType.equals(DatabaseTypeEnum.SQLServer.getCode())) {
            return new SqlServerTypeConvert() {
                @Override
                public IColumnType processTypeConvert(GlobalConfig globalConfig, String t) {
                    if (t.toLowerCase().contains("blob")) {
                        return DbColumnType.STRING;
                    }
                    return super.processTypeConvert(globalConfig, t);
                }
            };
        } else if (dbType.equals(DatabaseTypeEnum.Oracle.getCode())) {
            return new OracleTypeConvert() {
                @Override
                public IColumnType processTypeConvert(GlobalConfig globalConfig, String t) {
                    if (t.toLowerCase().contains("blob")) {
                        return DbColumnType.BYTE_ARRAY;
                    }else if (t.toLowerCase().contains("number")){
                        return DbColumnType.BIG_DECIMAL;
                    }
                    return super.processTypeConvert(globalConfig, t);
                }
            };
        }
        return null;
    }

}


