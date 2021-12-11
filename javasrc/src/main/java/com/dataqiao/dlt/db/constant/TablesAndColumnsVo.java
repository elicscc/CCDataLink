package com.dataqiao.dlt.db.constant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 名称和注释的vo,可以供表和列复用的vo
 *
 * @author cc
 * @date 2020-08-31
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TablesAndColumnsVo {
    /**
     * 表名称
     */
    private String tableName;
    /**
     * 字段名称
     */
    private String columnName;
    /**
     * 字段类型
     */
    private String columnType;
}
