package com.yuhui.marketing.raffle.service.armory.algorithm;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.ArrayDeque;
import java.util.List;

/** Immutable Walker/Vose alias table. O(n) preparation, O(n) storage, O(1) sampling. */
public final class AliasTable {
    private final long[] awards;
    private final double[] probability;
    private final int[] alias;
    public AliasTable(List<Long> ids, List<BigDecimal> weights) {
        if (ids == null || weights == null || ids.isEmpty() || ids.size() != weights.size())
            throw new IllegalArgumentException("Awards and weights must have equal nonzero size");
        if (new java.util.HashSet<>(ids).size() != ids.size() || ids.contains(null))
            throw new IllegalArgumentException("Award IDs must be unique and non-null");
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal w : weights) {
            if (w == null || w.signum() < 0) throw new IllegalArgumentException("Negative/null weight");
            sum = sum.add(w);
        }
        if (sum.signum() == 0) throw new IllegalArgumentException("Total weight must be positive");
        int n = ids.size(); awards = new long[n]; probability = new double[n]; alias = new int[n];
        double[] scaled = new double[n];
        ArrayDeque<Integer> small = new ArrayDeque<>(), large = new ArrayDeque<>();
        for (int i=0; i<n; i++) {
            awards[i]=ids.get(i); alias[i]=i;
            scaled[i]=weights.get(i).multiply(BigDecimal.valueOf(n)).divide(sum, MathContext.DECIMAL128).doubleValue();
            (scaled[i]<1 ? small : large).add(i);
        }
        while (!small.isEmpty() && !large.isEmpty()) {
            int s=small.removeLast(), l=large.removeLast();
            probability[s]=Math.max(0, Math.min(1, scaled[s])); alias[s]=l;
            scaled[l]=(scaled[l]+scaled[s])-1;
            (scaled[l]<1 ? small : large).add(l);
        }
        for (int i : large) probability[i]=1;
        for (int i : small) probability[i]=1;
    }
    public int size() { return awards.length; }
    public long sample(int column, double coin) {
        if (column<0 || column>=size() || !Double.isFinite(coin) || coin<0 || coin>=1)
            throw new IllegalArgumentException("Invalid random input");
        return coin < probability[column] ? awards[column] : awards[alias[column]];
    }
    // Store both outcomes in each Redis row, avoiding a second lookup of the alias target.
    public String row(int i) { return probability[i]+","+awards[i]+","+awards[alias[i]]; }
}
