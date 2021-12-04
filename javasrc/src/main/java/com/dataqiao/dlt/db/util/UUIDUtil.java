package com.dataqiao.dlt.db.util;

import java.util.UUID;

/**
 * uuidutil
 *
 * @author tengshe
 * @date 2020-09-09
 */
public class UUIDUtil {

    private UUIDUtil() {
    }

    public static String createUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
