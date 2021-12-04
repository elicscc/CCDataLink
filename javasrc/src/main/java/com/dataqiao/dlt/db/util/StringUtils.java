package com.dataqiao.dlt.db.util;



import java.util.List;

/**
 * 字符串工具类
 *
 * @author cc
 * @version 2013-05-22
 */
public class StringUtils {
    public static boolean isBlank(CharSequence charSequence) {
        return com.baomidou.mybatisplus.core.toolkit.StringUtils.isBlank(charSequence);
    }

    public static boolean isNotBlank(CharSequence charSequence) {
        return !isBlank(charSequence);
    }

    public static boolean isEmpty(Object o) {
        return o == null || "".equals(o);
    }

    public static boolean isNotEmpty(Object o) {
        return !isEmpty(o);
    }

    public static boolean hasLength(String[] str) {
        return str != null && str.length > 0;
    }

    public static boolean notHasLength(String[] str) {
        return !hasLength(str);
    }

    public static boolean notEmptyList(List<?> str) {
        return str != null && str.size() > 0;
    }

    public static boolean emptyList(List<?> str) {
        return !notEmptyList(str);
    }

    public static String join(List<?> strList) {
        return join(strList, ",");
    }

    public static String join(List<?> strList, String separator) {
        if (strList == null || strList.isEmpty()) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        sb.append(strList.get(0));

        for (int i = 1; i < strList.size(); i++) {
            sb.append(separator).append(strList.get(i));
        }
        return sb.toString();
    }

    /**
     * =
     *
     * @param o1 o1群
     * @param o2 o2
     * @return boolean
     */
    public static boolean equals(Object o1, Object o2) {
        if (o1 == null || o2 == null) {
            return false;
        }
        if (o1 == o2) {
            return true;
        }
        return o1.equals(o2);
    }

    public static boolean notEquals(Object o1, Object o2) {
        return !equals(o1, o2);
    }

}
