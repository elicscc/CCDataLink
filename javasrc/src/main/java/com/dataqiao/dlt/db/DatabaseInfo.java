package com.dataqiao.dlt.db;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * <p>
 * 数据库信息表
 * </p>
 *
 * @author cc
 * @since 2020-08-20
 */
@Data
@Accessors(chain = true)
public class DatabaseInfo {

    /**
     * 数据库类型DM
     */
    private String databaseType;

    /**
     * 数据库地址
     */
    private String databaseAddress;

    /**
     * 数据库名称
     */
    private String databaseName;

    /**
     * 端口号
     */
    private Integer port;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

}
