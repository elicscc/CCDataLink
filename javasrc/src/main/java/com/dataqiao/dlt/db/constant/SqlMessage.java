package com.dataqiao.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;


/**
 * @author cc
 * @date 2021-12-14
 */
@Data
public class SqlMessage implements Serializable {
    private static final long serialVersionUID = -1L;

    private String errorMessage;

    private String time;

    private String sql;

}
