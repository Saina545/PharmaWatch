package com.pharmawatch.service;

import com.pharmawatch.dto.DashboardDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.*;

@Service
public class PubMedService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<DashboardDTO.AlertDTO> fetchExternalData(String query) {
        List<DashboardDTO.AlertDTO> results = new ArrayList<>();
        try {
            // Step 1: Search PubMed for matching IDs (PMIDs)
            String searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=" 
                    + query + "&retmode=json&retmax=5";
            
            String searchResponse = restTemplate.getForObject(searchUrl, String.class);
            JsonNode searchNode = objectMapper.readTree(searchResponse);
            JsonNode idListNode = searchNode.path("esearchresult").path("idlist");

            if (idListNode.isMissingNode() || !idListNode.isArray() || idListNode.size() == 0) {
                return results; // Return empty array if no public articles match
            }

            // Extract IDs and join them with commas
            List<String> pmids = new ArrayList<>();
            for (JsonNode idNode : idListNode) {
                pmids.add(idNode.asText());
            }
            String joinedIds = String.join(",", pmids);

            // Step 2: Fetch the actual summaries for those IDs
            String summaryUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=" 
                    + joinedIds + "&retmode=json";
            
            String summaryResponse = restTemplate.getForObject(summaryUrl, String.class);
            JsonNode summaryNode = objectMapper.readTree(summaryResponse);
            JsonNode resultNode = summaryNode.path("result");

            List<DashboardDTO.PaperDTO> papersList = new ArrayList<>();

            // Step 3: Parse the summaries into PaperDTO format
            for (String pmid : pmids) {
                JsonNode articleNode = resultNode.path(pmid);
                if (!articleNode.isMissingNode()) {
                    String title = articleNode.path("title").asText("No Title Available");
                    String journal = articleNode.path("source").asText("Unknown Journal");
                    String pubDate = articleNode.path("pubdate").asText("");
                    String pubYearStr = pubDate.split(" ")[0].replaceAll("[^0-9]", ""); 

                    // Fix: Safely convert the string year to an integer
                    int pubYear = 2024;
                    try {
                        if (!pubYearStr.isEmpty()) {
                            pubYear = Integer.parseInt(pubYearStr);
                        }
                    } catch (NumberFormatException e) {
                        pubYear = 2024;
                    }

                    // Extract author list string
                    List<String> authors = new ArrayList<>();
                    JsonNode authorsNode = articleNode.path("authors");
                    if (authorsNode.isArray()) {
                        for (JsonNode author : authorsNode) {
                            authors.add(author.path("name").asText());
                        }
                    }
                    String authorString = String.join(", ", authors);

                    // Build the individual Paper object
                    DashboardDTO.PaperDTO paper = DashboardDTO.PaperDTO.builder()
                            .pmid(pmid)
                            .title(title)
                            .authors(authorString.isEmpty() ? "Unknown Authors" : authorString)
                            .journal(journal)
                            .pubYear(pubYear) // Now safely passing an int
                            .pubmedUrl("https://pubmed.ncbi.nlm.nih.gov/" + pmid)
                            .abstractSnippet("Investigational reference entry gathered in real-time from the global NCBI tracking index.")
                            .build();

                    papersList.add(paper);
                }
            }

           // Step 4: Map the external papers into an AlertDTO block
            if (!papersList.isEmpty()) {
                // NEW: Create a dynamic summary based on the paper titles
                String aiSummary = "Automated network scan identified " + papersList.size() + 
                    " recent publications for " + query + ". Key findings include: " + 
                    papersList.stream().map(p -> p.getTitle()).collect(Collectors.joining("; ")) + 
                    ". Review recommended for clinical relevance.";

                DashboardDTO.AlertDTO externalAlert = DashboardDTO.AlertDTO.builder()
                        .id(new Random().nextLong() & Long.MAX_VALUE)
                        .drugName(query.substring(0, 1).toUpperCase() + query.substring(1).toLowerCase())
                        .sideEffect("Clinical Research Overview")
                        .summary(aiSummary) // Now it contains actual content!
                        .paperCount(papersList.size())
                        .spikePercentage(0.0)
                        .severity("INFO")
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .papers(papersList)
                        .build();

                results.add(externalAlert);
            }

        } catch (Exception e) {
            System.err.println("Failed to fetch data directly from PubMed API: " + e.getMessage());
        }

        return results;
    }
}