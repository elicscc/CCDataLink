package com.cc.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;


/**
 * @author cc
 * @date 2022-01-04
 */
@Data
public class TableInfoVo implements Serializable {
    private static final long serialVersionUID = -1L;

    private String tableName;

    private String databaseType;

    private String createSql;

    private List<Map<String, String>> indexList;

    private List<Map<String, String>> columnList;
}
