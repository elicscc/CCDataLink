package com.dataqiao.dlt.db.util.tableimport;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * 记忆类装入器
 *
 * @author cc
 * @date 2021/04/19
 */
public class MemoryClassLoader extends ClassLoader{

    private final String classPath;

    public MemoryClassLoader(String classPath) {
        this.classPath = classPath;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            String path = classPath  + name.replace('.', '/').concat(".class");
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            return defineClass(name, bytes, 0, bytes.length);
        } catch (IOException e) {
        }

        return super.findClass(name);

    }
}


