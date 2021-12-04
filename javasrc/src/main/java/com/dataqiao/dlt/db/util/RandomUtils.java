package com.dataqiao.dlt.db.util;

import java.util.Random;
import java.util.UUID;


/**
 * 随机数工具类
 *
 * @author 连城诀
 * @date 2016年10月10日 上午8:50:13
 */
public class RandomUtils {

    private static final Random RANDOM = new Random();

    public static Random getRandom() {
        return RANDOM;
    }

    private static final char[] CHARS = {
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g',
            'h', 'i', 'j', 'k', 'l', 'm', 'n',
            'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N',
            'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z',
            '@', '#', '$', '!'
    };

    /**
     * 随机生成由0-9a-zA-Z组合而成的字符串
     *
     * @param len 字符串长度
     * @return 生成结果
     */
    public static String randomChar(int len) {
        StringBuilder shortBuffer = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            shortBuffer.append(CHARS[RANDOM.nextInt(CHARS.length)]);
        }
        return shortBuffer.toString();
    }

    public static int getInt(int bound) {
        return RANDOM.nextInt(bound);
    }

    /**
     * 随机生成一个给定长度的字符串,如果content为空,则生成一个纯数字的字符串
     *
     * @param content 内容
     * @param length  长度
     * @return {@link String}
     */
    public static String generateString(String content, int length) {
        String source;
        if (StringUtils.isNotBlank(content)) {
            source = content;
        } else {
            source = new String(CHARS, 0, 10);
        }
        if (length < 1) {
            length = 6;
        }
        StringBuilder genStr = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            genStr.append(source.charAt(RANDOM.nextInt(source.length())));
        }
        return genStr.toString().toUpperCase();
    }

    /**
     * 生成字符串
     *
     * @param length 长度
     * @return {@link String}
     */
    public static String generateString(int length) {
        return generateString(null, length);
    }

    public static String uuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
