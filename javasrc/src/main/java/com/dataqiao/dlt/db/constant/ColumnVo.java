package com.dataqiao.dlt.db.constant;

import lombok.Data;

import java.io.Serializable;

/**
 * 前端 列 Vo类
 *
 * @author cc
 */
@Data
public class ColumnVo implements Serializable {

    private static final long serialVersionUID = -309910371657089242L;
    /**
     * 存储下拉框选择器中每个选项的名称
     */
    private String title;

    /**
     * 存储下拉框选择器中每个选项的key
     */
    private String key;

    private Boolean resizable;
    private Boolean ellipsis;
    private Boolean tooltip;

    private Integer width;
}
