package com.yuhui.types.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**

 * 分页响应类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyPage<T> {
    //总条数
    private Long total;
    //当前页数据集合
    private List<T> items;
}
