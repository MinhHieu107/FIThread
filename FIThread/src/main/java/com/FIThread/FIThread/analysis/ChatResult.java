package com.FIThread.FIThread.analysis;

import java.util.List;

public record ChatResult(String answer, String status, List<Integer> sourceIds) {}