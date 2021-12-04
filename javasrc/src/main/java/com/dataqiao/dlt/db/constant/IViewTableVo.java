package com.dataqiao.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * IView table Vo类
 *
 * @author cc
 * @date 2020-09-07
 */
@Data
public class IViewTableVo implements Serializable {
    private static final long serialVersionUID = -1L;
    /**
     * 列
     */
    private List<ColumnVo> columns;
    /**
     * 数据列表
     */
    private List<Map<String, String>> dataList;

}
