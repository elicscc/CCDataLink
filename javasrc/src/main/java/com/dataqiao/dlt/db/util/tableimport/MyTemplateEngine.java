package com.dataqiao.dlt.db.util.tableimport;


import com.baomidou.mybatisplus.core.toolkit.StringPool;
import com.baomidou.mybatisplus.generator.config.ConstVal;
import com.baomidou.mybatisplus.generator.config.TemplateConfig;
import com.baomidou.mybatisplus.generator.config.builder.ConfigBuilder;
import com.baomidou.mybatisplus.generator.config.po.TableField;
import com.baomidou.mybatisplus.generator.config.po.TableInfo;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;
import com.dataqiao.dlt.db.constant.DatabaseTypeEnum;
import freemarker.template.Configuration;
import freemarker.template.Template;
import lombok.extern.slf4j.Slf4j;

import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;


/**
 * 我的模板引擎
 *
 * @author cc
 * @date 2021/04/19
 */
@Slf4j
public class MyTemplateEngine extends FreemarkerTemplateEngine {
    private Configuration configuration;
    public static final Pattern DIGIT = Pattern.compile("^\\d");
    public static final String ID = "id";
    public static final String UNDER_LINE = "_";

    /**
     * 是需要处理的key吗,id或者数字开头
     *
     * @param k k
     * @return boolean
     */
    public static boolean isSpecialKey(String k) {
        return k.equalsIgnoreCase(ID) || DIGIT.matcher(k).find();
    }

    @Override
    public MyTemplateEngine init(ConfigBuilder configBuilder) {
        super.init(configBuilder);
        configuration = new Configuration(Configuration.DEFAULT_INCOMPATIBLE_IMPROVEMENTS);
        configuration.setDefaultEncoding(ConstVal.UTF8);
        configuration.setClassForTemplateLoading(FreemarkerTemplateEngine.class, StringPool.SLASH);
        return this;
    }

    /**
     * 使用 模版引擎生成一个java文件,并编译生成.class文件
     *
     * @param packagePath 包的路径， 以斜线结束
     * @param dbType
     * @throws Exception 异常
     */
    public void generate(String packagePath, String dbType) throws Exception {
        List<TableInfo> tableInfoList = getConfigBuilder().getTableInfoList();
        for (TableInfo tableInfo : tableInfoList) {
            Map<String, Object> objectMap = getObjectMap(tableInfo);
            TemplateConfig template = getConfigBuilder().getTemplate();

            checkSpecialColumnName(tableInfo);
            if (dbType.equals(DatabaseTypeEnum.Oracle.getCode())) {
                addQuoteForOracle(tableInfo);
            }
            // Mp.java
            String entityName = tableInfo.getEntityName();
            writer(objectMap, templateFilePath(template.getEntity(getConfigBuilder().getGlobalConfig().isKotlin())), packagePath + entityName + ".java");
            // MpMapper.java
            writer(objectMap, templateFilePath(template.getMapper()), packagePath + entityName + "Mapper.java");

            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            List<String> options = Arrays.asList("-d", packagePath);
            try (StandardJavaFileManager manager = compiler.getStandardFileManager(null, null, StandardCharsets.UTF_8)) {
                String entityPath = packagePath + entityName + ".java";
                String mapperPath = packagePath + entityName + "Mapper.java";
                Iterable<? extends JavaFileObject> javaFileObjects = manager.getJavaFileObjects(new File(entityPath), new File(mapperPath));
                JavaCompiler.CompilationTask task = compiler.getTask(null, manager, null, options, null, javaFileObjects);
                Boolean call = task.call();
                if (call != null && !call) {
                    log.error("compiler error, file content is {}, {}", new String(Files.readAllBytes(Paths.get(entityPath))),
                            new String(Files.readAllBytes(Paths.get(mapperPath))));
                }
            }

        }
    }

    @Override
    public void writer(Map<String, Object> objectMap, String templatePath, String outputFile) throws Exception {
        Template template = configuration.getTemplate(templatePath);
        try (FileOutputStream fileOutputStream = new FileOutputStream(outputFile)) {
            template.process(objectMap, new OutputStreamWriter(fileOutputStream, ConstVal.UTF8));
        }
    }

    /**
     * 检查特殊列名,如果列名或者表名是数字开头,生成的java文件可能无法编译,处理成下划线开头
     *
     * @param tableInfo 表信息
     */
    private void checkSpecialColumnName(TableInfo tableInfo) {
        for (TableField field : tableInfo.getFields()) {
            if (isSpecialKey(field.getPropertyName())) {
                field.setPropertyName(UNDER_LINE + field.getPropertyName());
            }
        }
    }

    /**
     * 添加对甲骨文 double quotation mark
     *
     * @param tableInfo 表信息
     */
    private void addQuoteForOracle(TableInfo tableInfo) {
        tableInfo.setName("\\\"" + tableInfo.getName() + "\\\"");
        for (TableField field : tableInfo.getFields()) {
            field.setColumnName("\\\"" + field.getColumnName() + "\\\"");
        }
    }

}
