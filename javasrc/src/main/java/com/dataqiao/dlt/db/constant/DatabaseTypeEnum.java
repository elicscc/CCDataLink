package com.dataqiao.dlt.db.constant;

import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author cc
 */
@Getter
public enum DatabaseTypeEnum {
    /**
     * DatabaseType
     */
    MySQL("1", "MySQL"),

    SQLServer("2", "SQLServer"),

    Oracle("3", "Oracle"),

    ;
    private final String code;
    private final String name;

    DatabaseTypeEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }


    public static final Map<String, String> MAP = Arrays.stream(DatabaseTypeEnum.values())
            .collect(Collectors.toMap(DatabaseTypeEnum::getCode, DatabaseTypeEnum::getName));

    public static String getNameByCode(String code) {
        return MAP.get(code);
    }
}
