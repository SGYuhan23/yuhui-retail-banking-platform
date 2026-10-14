package com.yuhui.types.model;
import org.springframework.beans.BeanUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
/** Projection keeps BeanUtils null/property semantics and the caller's list ordering. */
public final class BeanProjection {
    private BeanProjection() { }
    public static <T> T copy(Object source, Supplier<T> factory) {
        T target = factory.get();
        BeanUtils.copyProperties(source, target);
        return target;
    }
    public static <T> List<T> list(Iterable<?> source, Supplier<T> factory) {
        List<T> result = new ArrayList<>();
        for (Object item : source) result.add(copy(item, factory));
        return result;
    }
}
