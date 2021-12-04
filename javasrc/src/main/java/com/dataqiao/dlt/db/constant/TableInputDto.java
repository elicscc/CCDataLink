package com.dataqiao.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.List;
import java.util.Map;

/**
 * table Vo类
 *
 * @author cc
 * @date 2020-09-07
 */
@Data
public class TableInputDto implements Serializable {
    private static final long serialVersionUID = -1L;
    /**
     * resultSet
     */
    private ResultSet resultSet;
    /**
     * conn
     */
    private Connection conn;

}
