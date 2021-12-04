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
public class NameCommentVo {
    /**
     * 名称
     */
    private String name;
    /**
     * 注释
     */
    private String cm;
}
