package com.cc.dlt.db.util;


import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;


/**
 * 日期转化工具类
 *
 * @author cc
 * @date 2020-05-25
 */
public class DateUtils {

    /**
     * 默认格式str
     * 常用格式如下
     * "yyyy-MM-dd", "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM",
     * "yyyyMMdd", "yyyyMMdd HH:mm:ss", "yyyyMMdd HH:mm", "yyyyMM", "yyyy/MM/dd", "yyyy/MM/dd HH:mm:ss",
     * "yyyy/MM/dd HH:mm", "yyyy/MM", "yyyy.MM.dd", "yyyy.MM.dd HH:mm:ss", "yyyy.MM.dd HH:mm", "yyyy.MM"
     */
    public static final String DEFAULT_FORMAT_STR = "yyyy-MM-dd HH:mm:ss";
    public static final DateTimeFormatter DEFAULT_FORMAT = DateTimeFormatter.ofPattern(DEFAULT_FORMAT_STR);
    public static final String YMD_FORMAT_STR = "yyyy-MM-dd";
    public static final DateTimeFormatter YMD_FORMAT = DateTimeFormatter.ofPattern(YMD_FORMAT_STR);

    public static final String HMS_FORMAT_STR = "HH:mm:ss";
    public static DateTimeFormatter HMS_FORMAT = DateTimeFormatter.ofPattern(HMS_FORMAT_STR);

    public static String formatDateTime(Date date) {
        Instant instant = date.toInstant();
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDateTime localDateTime = instant.atZone(zoneId).toLocalDateTime();
        return localDateTime.format(DEFAULT_FORMAT);
    }

    public static String getDateTime() {
        return LocalDateTime.now().format(DEFAULT_FORMAT);
    }
}
