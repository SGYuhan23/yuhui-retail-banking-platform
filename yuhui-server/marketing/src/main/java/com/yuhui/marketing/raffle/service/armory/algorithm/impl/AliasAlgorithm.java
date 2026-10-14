package com.yuhui.marketing.raffle.service.armory.algorithm.impl;
import com.yuhui.marketing.raffle.model.entity.StrategyAwardEntity;
import com.yuhui.marketing.raffle.service.armory.algorithm.AbstractAlgorithm;
import com.yuhui.marketing.raffle.service.armory.algorithm.AliasTable;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Component("alias")
public class AliasAlgorithm extends AbstractAlgorithm {
    @javax.annotation.Resource private com.yuhui.marketing.raffle.repository.RaffleProbabilityIndex probabilityIndex;
    @Override public void armoryAlgorithm(String key, List<StrategyAwardEntity> awards, BigDecimal unused) {
        AliasTable table = new AliasTable(awards.stream().map(StrategyAwardEntity::getAwardId).toList(),
                awards.stream().map(StrategyAwardEntity::getAwardRate).toList());
        Map<Integer,String> rows=new LinkedHashMap<>();
        for(int i=0;i<table.size();i++) rows.put(i,table.row(i));
        probabilityIndex.publishAliasTable(key,rows);
    }
    @Override public Long dispatchAlgorithm(String key) {
        String snapshot=probabilityIndex.aliasSnapshot(key);
        if(snapshot==null) throw new IllegalStateException("Alias table requires warmup");
        int count=Integer.parseInt(snapshot.substring(snapshot.lastIndexOf(':')+1));
        String row=probabilityIndex.aliasRow(snapshot,secureRandom.nextInt(count));
        if(row==null) throw new IllegalStateException("Alias snapshot missing; retry after warmup");
        String[] parts=row.split(",");
        return Long.valueOf(parts[secureRandom.nextDouble()<Double.parseDouble(parts[0])?1:2]);
    }
}
