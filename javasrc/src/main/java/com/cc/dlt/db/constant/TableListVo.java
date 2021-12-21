package com.cc.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;


/**
 * @author cc
 * @date 2021-12-14
 */
@Data
public class TableListVo implements Serializable {
    private static final long serialVersionUID = -1L;

    private Integer count;

    private String databaseType;

    private List<Map<String, String>> dataList;

    private List<Map<String, String>> columnInfo;
}
