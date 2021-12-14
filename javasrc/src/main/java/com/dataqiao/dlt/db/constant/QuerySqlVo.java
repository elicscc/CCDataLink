package com.dataqiao.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;
import java.util.List;


/**
 * @author cc
 * @date 2021-12-14
 */
@Data
public class QuerySqlVo implements Serializable {
    private static final long serialVersionUID = -1L;

    private String sql;

    private int count;

    private List<IViewTableVo> resultSet;

}
