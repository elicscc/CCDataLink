package com.cc.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;

/**
 * 列信息
 *
 * @author cc
 */
@Data
public class ColumnInfo implements Serializable {

    private static final long serialVersionUID = -1L;

    private String COLUMN_NAME;
    private String COLUMN_TYPE;
    private String IS_NULLABLE;
    private String COLUMN_KEY;
    private String COLUMN_DEFAULT;
    private String EXTRA;
}
