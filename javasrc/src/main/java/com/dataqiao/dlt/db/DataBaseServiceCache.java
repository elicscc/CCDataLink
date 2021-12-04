package com.dataqiao.dlt.db;

import com.dataqiao.dlt.db.util.StringUtils;
import lombok.Data;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 数据库服务缓存
 *
 * @author cc
 * @date 2021/08/03
 */
public class DataBaseServiceCache {

    public static final ConcurrentHashMap<CacheKey, DatabaseService> CACHE_MAP = new ConcurrentHashMap<>();

    /**
     * 得到数据库服务,如果缓存中有,则直接使用缓存中的对象,否则new 一个
     *
     * @param databaseInfoStr str数据库信息
     * @param tableName       表名
     * @param isEmpty         是空的
     * @param cachePath       缓存路径
     * @param taskRunUuid     任务运行uuid
     * @param cmptUuid        cmpt uuid
     * @return {@link DatabaseService}
     */
    public static DatabaseService getDatabaseService(String databaseInfoStr, String tableName, String isEmpty,
                                                     String cachePath,
                                                     String taskRunUuid,
                                                     String cmptUuid) {
        CacheKey key = new CacheKey(taskRunUuid, cmptUuid);
        DatabaseService databaseService = CACHE_MAP.get(key);
        if (databaseService == null
                || !Objects.equals(databaseService.getTableName(), tableName)
                || !Objects.equals(databaseService.getDatabaseInfoStr(), databaseInfoStr)
                || !Objects.equals(databaseService.getIsEmpty(), isEmpty)) {

            if (StringUtils.isNotBlank(tableName)) {
                databaseService = new TableOutputService(databaseInfoStr, tableName, isEmpty, cachePath, key);
            } else {
                databaseService = new ExecuteSqlService(databaseInfoStr, key);
            }
            CACHE_MAP.put(key, databaseService);
        }
        databaseService.initSqlSession();
        return databaseService;
    }


    /**
     * 缓存摧毁
     *
     * @param taskRunUuid 任务运行uuid
     */
    public static void cacheDestroy(String taskRunUuid) {
        for (Map.Entry<CacheKey, DatabaseService> entry : CACHE_MAP.entrySet()) {
            if (entry.getKey().getTaskRunUuid().equals(taskRunUuid)) {
                entry.getValue().close();
                CACHE_MAP.remove(entry.getKey());
            }
        }
    }

    /**
     * 缓存键,运行的uuid和组件的uuid组合起来才具有唯一性
     * 所以自定义一个key对象
     *
     * @author cc
     * @date 2021/08/04
     */
    @Data
    public static class CacheKey {
        private String taskRunUuid;
        private String cmptUuid;
        private long updateTimeStamp;

        public CacheKey(String taskRunUuid, String cmptUuid) {
            this.taskRunUuid = taskRunUuid;
            this.cmptUuid = cmptUuid;
            this.updateTimeStamp = System.currentTimeMillis();
        }

        @Override
        public int hashCode() {
            return taskRunUuid.hashCode() + cmptUuid.hashCode();
        }

        @Override
        public boolean equals(Object o) {
            if (o == this) {
                return true;
            }
            if (o instanceof CacheKey) {
                CacheKey anotherKey = (CacheKey) o;
                return StringUtils.equals(anotherKey.getCmptUuid(), this.cmptUuid)
                        && StringUtils.equals(anotherKey.getTaskRunUuid(), this.taskRunUuid);
            }
            return false;
        }
    }
}
